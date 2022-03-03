import fs from 'fs';

export async function getAppConfiguration() {
    if (fs.existsSync("config.json")) {
        global.appConfig = JSON.parse(fs.readFileSync("config.json"));
        return global.appConfig;
    } else {
        let defaultConfig = {
            espruino_binaries_apache_index: "http://www.espruino.com/binaries/",
            esptool_github_releases_manifest: "https://api.github.com/repos/espressif/esptool/releases"
        };
        fs.writeFileSync("config.json", JSON.stringify(defaultConfig));
        global.appConfig = defaultConfig;
        return defaultConfig;
    }
}

export async function changeSetting(key, value) {
    global.appConfig[key] = value;
    fs.writeFileSync("config.json", JSON.stringify(global.appConfig));
}