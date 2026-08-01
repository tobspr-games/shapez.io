{
  description = "shapez.io build environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
  };

  outputs =
    { self, nixpkgs }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "x86_64-darwin"
        "aarch64-darwin"
      ];

      forAllSystems = nixpkgs.lib.genAttrs supportedSystems;

      buildRevision = self.shortRev or self.dirtyShortRev or "nix-build";

      importPkgs =
        system:
        import nixpkgs {
          inherit system;
          config.permittedInsecurePackages = [
            "electron-16.2.8"
            "nodejs-16.20.2"
          ];
        };
    in
    {
      packages = forAllSystems (
        system:
        let
          pkgs = importPkgs system;

          nodejs = pkgs.nodejs_16;

          installYarnDeps =
            offlineCache:
            ''
              yarn config --offline set yarn-offline-mirror ${offlineCache}
              yarn config --offline set yarn-offline-mirror-pruning false
              fixup_yarn_lock yarn.lock
              node -e '
                const fs = require("fs");
                const cache = process.argv[1];
                let lock = fs.readFileSync("yarn.lock", "utf8");
                lock = lock.replace(
                  /^  resolved "([^"]+)"/gm,
                  (_line, resolved) => "  resolved \"file://" + cache + "/" + resolved + "\""
                );
                fs.writeFileSync("yarn.lock", lock);
              ' ${offlineCache}
              yarn install \
                --offline \
                --frozen-lockfile \
                --ignore-optional \
                --ignore-scripts \
                --no-progress \
                --production=false \
                --non-interactive
              patchShebangs node_modules
            '';

          runtimeTools = with pkgs; [
            curl
            ffmpeg
            git
            jdk
            nodejs
            wget
            yarn
          ];
        in
        {
          default = pkgs.stdenv.mkDerivation rec {
            pname = "shapez.io";
            version = builtins.replaceStrings [ "\n" "\r" ] [ "" "" ] (builtins.readFile ./version);

            src = nixpkgs.lib.cleanSource ./.;

            rootOfflineCache = pkgs.fetchYarnDeps {
              name = "shapez-root-yarn-cache";
              yarnLock = ./yarn.lock;
              sha256 = "sha256-o0/wOmsR0xW79CukG9M9em0rYEZKSDUnt0F3wvdNN/I=";
            };

            gulpOfflineCache = pkgs.fetchYarnDeps {
              name = "shapez-gulp-yarn-cache";
              yarnLock = ./gulp/yarn.lock;
              sha256 = "sha256-lugrub99NUGXrX14gKxNreDA2NoBeZuRqvZjK4Wkqxo=";
            };

            texturePacker = pkgs.fetchurl {
              url = "https://libgdx-nightlies.s3.eu-central-1.amazonaws.com/libgdx-runnables/runnable-texturepacker.jar";
              sha256 = "sha256-ZrkHRg4cefc5WEeAoYHwLKbYBSqYwGoRRCU7P+FCkSU=";
            };

            nativeBuildInputs = runtimeTools ++ [
              pkgs.fixup_yarn_lock
              pkgs.perl
            ];

            postPatch = ''
              perl -0pi -e 's/const commitHash = execSync\("git rev-parse --short " \+ \(useLast \? "HEAD\^1" : "HEAD"\)\)\.toString\(\s*"ascii"\s*\);/const commitHash = process.env.SHAPEZ_BUILD_COMMIT || "nix-build";/s' gulp/buildutils.js
            '';

            configurePhase = ''
              runHook preConfigure

              export HOME="$TMPDIR"
              export JAVA_HOME="${pkgs.jdk.home}"
              export NODE_OPTIONS="--openssl-legacy-provider"

              ${installYarnDeps rootOfflineCache}

              cd gulp
              ${installYarnDeps gulpOfflineCache}
              cd ..

              runHook postConfigure
            '';

            buildPhase = ''
              runHook preBuild

              export HOME="$TMPDIR"
              export JAVA_HOME="${pkgs.jdk.home}"
              export NODE_OPTIONS="--openssl-legacy-provider"
              export SHAPEZ_BUILD_COMMIT="${buildRevision}"

              cp ${texturePacker} gulp/runnable-texturepacker.jar

              cd gulp
              ./node_modules/.bin/gulp build.prepare.dev
              ./node_modules/.bin/gulp js.web-localhost.dev
              ./node_modules/.bin/gulp html.web-localhost.dev
              cd ..

              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall

              mkdir -p "$out/share/shapez.io"
              cp -R build/. "$out/share/shapez.io/"

              runHook postInstall
            '';

            meta = {
              description = "Static debug web build of shapez.io";
              homepage = "https://github.com/tobspr-games/shapez.io";
              license = nixpkgs.lib.licenses.mit;
            };
          };

          electronApp = pkgs.stdenv.mkDerivation rec {
            pname = "shapez.io-electron-app";
            version = builtins.replaceStrings [ "\n" "\r" ] [ "" "" ] (builtins.readFile ./version);

            src = ./electron;

            electronPublicYarnLock = pkgs.runCommand "shapez-electron-public-yarn.lock" { } ''
              ${pkgs.gnused}/bin/sed \
                '/^"shapez.io-private-artifacts@github:tobspr\/shapez.io-private-artifacts#abi-v99":$/,+2d' \
                ${./electron/yarn.lock} > "$out"
            '';

            electronOfflineCache = pkgs.fetchYarnDeps {
              name = "shapez-electron-yarn-cache";
              yarnLock = electronPublicYarnLock;
              sha256 = "sha256-99tV14+3+O2tFMtaMSOUcE9OgI7clM0UkotUVc4SmKU=";
            };

            nativeBuildInputs = [
              nodejs
              pkgs.fixup_yarn_lock
              pkgs.yarn
            ];

            configurePhase = ''
              runHook preConfigure

              export HOME="$TMPDIR"
              node -e '
                const fs = require("fs");
                const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
                delete pkg.optionalDependencies;
                fs.writeFileSync("package.json", JSON.stringify(pkg, null, 4));
              '
              cp ${electronPublicYarnLock} yarn.lock

              ${installYarnDeps electronOfflineCache}

              runHook postConfigure
            '';

            buildPhase = ''
              runHook preBuild
              runHook postBuild
            '';

            installPhase = ''
              runHook preInstall

              mkdir -p "$out/app"
              cp -R . "$out/app"

              runHook postInstall
            '';

            meta = {
              description = "Electron app shell for the shapez.io RL API";
              homepage = "https://github.com/tobspr-games/shapez.io";
              license = nixpkgs.lib.licenses.mit;
            };
          };
        }
      );

      devShells = forAllSystems (
        system:
        let
          pkgs = importPkgs system;
          nodejs = pkgs.nodejs_16;
        in
        {
          default = pkgs.mkShell {
            packages = with pkgs; [
              curl
              ffmpeg
              git
              jdk
              nodejs
              wget
              yarn
            ];

            JAVA_HOME = pkgs.jdk.home;
            NODE_OPTIONS = "--openssl-legacy-provider";

            shellHook = ''
              echo "Node: $(node --version)"
              echo "Yarn: $(yarn --version)"
              echo "Run: yarn && (cd gulp && yarn) && yarn dev"
            '';
          };
        }
      );

      apps = forAllSystems (
        system:
        let
          pkgs = importPkgs system;
          serve = pkgs.writeShellScriptBin "shapez-serve" ''
            exec ${pkgs.python3}/bin/python3 -m http.server 3005 --bind 127.0.0.1 --directory ${self.packages.${system}.default}/share/shapez.io
          '';
          rl = pkgs.writeShellScriptBin "shapez-rl" ''
            set -euo pipefail

            rl_port="''${SHAPEZ_RL_API_PORT:-17872}"

            ${pkgs.python3}/bin/python3 -m http.server 3005 --bind 127.0.0.1 --directory ${self.packages.${system}.default}/share/shapez.io &
            web_pid="$!"

            cleanup() {
              kill "$web_pid" >/dev/null 2>&1 || true
            }
            trap cleanup EXIT INT TERM

            for _ in $(${pkgs.coreutils}/bin/seq 1 50); do
              if ${pkgs.curl}/bin/curl -fsS http://127.0.0.1:3005/ >/dev/null 2>&1; then
                break
              fi
              ${pkgs.coreutils}/bin/sleep 0.1
            done

            echo "shapez web server: http://127.0.0.1:3005"
            echo "shapez RL API: http://127.0.0.1:$rl_port/rl/gamestate"

            export SHAPEZ_RL_API=1
            export SHAPEZ_RL_API_PORT="$rl_port"

            set +e
            ${pkgs.electron_16}/bin/electron \
              --disable-direct-composition \
              --in-process-gpu \
              ${self.packages.${system}.electronApp}/app \
              --dev \
              --local \
              "$@"
            status="$?"
            set -e

            exit "$status"
          '';
        in
        {
          default = {
            type = "app";
            program = "${serve}/bin/shapez-serve";
            meta.description = "Serve the static shapez.io web build on localhost:3005";
          };
          rl = {
            type = "app";
            program = "${rl}/bin/shapez-rl";
            meta.description = "Serve shapez.io and launch Electron with the RL gamestate API enabled";
          };
        }
      );
    };
}
