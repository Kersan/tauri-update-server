const extensions = [
    { target: 'windows', arch: 'x86_64', extension: 'x64-setup.exe' },
    { target: 'windows', arch: 'i686', extension: 'x86-setup.exe' },
    { target: 'darwin', arch: 'x86_64', extension: 'x64.app.tar.gz' },
    { target: 'darwin', arch: 'aarch64', extension: 'aarch64.app.tar.gz' },
    { target: 'linux', arch: 'x86_64', extension: 'amd64.AppImage.tar.gz' },
];
export const getReleases = (assets: Array<any>, target: string, arch: string): any => {
    let data = {} || undefined;
    const targetExtension = extensions.filter((element) => target === element.target && arch === element.arch)[0];
    if (targetExtension) {
        assets.forEach((release) => {
            if (release.name.endsWith(targetExtension.extension)) {
                data['url'] = release.browser_download_url;
                data['assets_url'] = release.url
                data['date'] = release.created_at;
            } else {
                if (process.env.SIGNATURE === 'true' && release.name.endsWith(targetExtension.extension + '.sig')) {
                    data['assets'] = release.url;
                }
            }
        });
    }
    return data;
};
