import axios from 'axios';
import fs from 'fs';
import tmp from 'tmp';
import unzipper from 'unzipper';
import path from 'path';

export async function init(update) {
    if (!fs.existsSync("bin")) fs.mkdir("bin");
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
    if (!update && fs.existsSync("bin/info.json") && fs.existsSync(bin)) {
        return bin;
    } else {
        console.log("Updating esptool");
        let json = await axios.get("https://api.github.com/repos/espressif/esptool/releases");
        let latest = json[0];
        let latest_asset = latest.assets.find(x => x.name.includes(os));
        let file = latest_asset.browser_download_url;
        let filename = latest_asset.name;
        console.log("Downloading esptool...");
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
        fs.copyFileSync(path.resolve(espzipdir.name, path.parse(filename).name, "esptool"), path.resolve(process.cwd(), "bin/esptool"));
        console.log("Downloaded");
        console.log("Saving json manifest");
        fs.writeFileSync("bin/info.json", JSON.stringify({
            version: latest.tag_name
        }));
        return bin;
    }
}
