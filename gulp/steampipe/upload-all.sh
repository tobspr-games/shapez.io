#!/bin/sh
set -e
cd "$(dirname "$0")/.."
mkdir -p steampipe/built_vdfs steampipe/tmp
yarn gulp standalone.prepareVDF
steamcmd +login "$STEAM_UPLOAD_SHAPEZ_ID" $STEAM_UPLOAD_SHAPEZ_USER +run_app_build "$PWD/steampipe/built_vdfs/app-all.vdf" +quit
