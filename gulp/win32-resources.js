// Sets icon and version info on a packaged Windows executable without rcedit/wine,
// so Windows builds can be produced from macOS or Linux hosts.
const fs = require("fs");
const ResEdit = require("resedit");

const LANG_EN_US = 1033;
const CODEPAGE_UNICODE = 1200;
const ICON_GROUP_ID = 1;

/**
 * @param {string} exePath
 * @param {{ icon: string, version: string, productName: string, company: string }} opts
 */
function applyWin32Resources(exePath, opts) {
    const exe = ResEdit.NtExecutable.from(fs.readFileSync(exePath));
    const res = ResEdit.NtExecutableResource.from(exe);

    const iconFile = ResEdit.Data.IconFile.from(fs.readFileSync(opts.icon));
    ResEdit.Resource.IconGroupEntry.replaceIconsForResource(
        res.entries,
        ICON_GROUP_ID,
        LANG_EN_US,
        iconFile.icons.map(icon => icon.data)
    );

    const parts = opts.version.split(".").map(part => parseInt(part, 10) || 0);
    while (parts.length < 4) {
        parts.push(0);
    }
    const [major, minor, patch, build] = parts;

    const existing = ResEdit.Resource.VersionInfo.fromEntries(res.entries);
    const versionInfo = existing.length > 0 ? existing[0] : ResEdit.Resource.VersionInfo.createEmpty();
    versionInfo.setFileVersion(major, minor, patch, build, LANG_EN_US);
    versionInfo.setProductVersion(major, minor, patch, build, LANG_EN_US);
    versionInfo.setStringValues(
        { lang: LANG_EN_US, codepage: CODEPAGE_UNICODE },
        {
            FileDescription: opts.productName,
            ProductName: opts.productName,
            CompanyName: opts.company,
            LegalCopyright: opts.company,
            OriginalFilename: "shapezio.exe",
            InternalName: "shapezio",
            FileVersion: opts.version,
            ProductVersion: opts.version,
        }
    );
    versionInfo.outputToResourceEntries(res.entries);

    res.outputResource(exe);
    fs.writeFileSync(exePath, Buffer.from(exe.generate()));
}

module.exports = { applyWin32Resources };
