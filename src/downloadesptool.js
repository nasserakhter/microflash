import axios from 'axios';
import fs from 'fs';
import tmp from 'tmp';
import unzipper from 'unzipper';
import path from 'path';

export async function init(update) {
    console.log("[ ok ] bin folder exists");
    if (!fs.existsSync("bin")) {
        fs.mkdir("bin");
    }
    console.log("Getting platform dependent config...");
    let bin = "bin/esptool";
    let os = "";
    switch (process.platform) {
        case "win32":
            bin = "bin/esptool.exe";
            os = "win";
            break;
        case "darwin":
            bin = "bin/esptool";
            os = "macos";
            break;
        default:
            bin = "bin/esptool";
            os = "linux";
            break;
    }
    console.log(`[ ok ] platform: ${os}`);
    if (!update && fs.existsSync("bin/info.json") && fs.existsSync(bin)) {
        console.log(`[ ok ] Found existing esptool binary at ${bin}`);
        return bin;
    } else {
        console.log("Updating esptool");
        console.log("[ github ] get latest release at espressif/esptool");
        let json = await axios.get(global.appConfig.esptool_github_releases_manifest);
        let latest = json[0];
        let latest_asset = latest.assets.find(x => x.name.includes(os));
        console.log("[ github ] latest release: " + latest.tag_name);
        let file = latest_asset.browser_download_url;
        let filename = latest_asset.name;
        console.log("Downloading bundled zip from github...");
        let response = await axios({ url: file, responseType: 'arraybuffer' });
        let espzip = tmp.fileSync();
        fs.writeFileSync(espzip.name, response.data);
        let espzipdir = tmp.dirSync();
        console.log("Extracting esptool...");
        await new Promise(resolve => {
            fs.createReadStream(espzip.name)
                .pipe(unzipper.Extract({ path: espzipdir.name }))
                .on('finish', resolve);
        });
        console.log("Copying binaries to bin folder...");
        fs.copyFileSync(path.resolve(espzipdir.name, path.parse(filename).name, "esptool"), path.resolve(process.cwd(), "bin/esptool"));
        console.log("Esptool Updated");
        fs.writeFileSync("bin/info.json", JSON.stringify({
            version: latest.tag_name
        }));
        return bin;
    }
}
