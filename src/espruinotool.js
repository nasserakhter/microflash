import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import tmp from 'tmp';

export async function getLatestVersion() {
    let response = {
        data: fs.readFileSync("./index.html")
    };
    let document = new JSDOM(response.data).window.document;
    let versions = [...document.querySelectorAll('a[href*="esp8266_4mb_combined_4096.bin"]')].map(a => a.textContent);
    versions = versions.sort((a, b) => a > b ? -1 : 1);
    let latest = versions[0];
    return {
        versions: versions,
        latest: latest,
        latestShort: latest.split("_")[1]
    }
}

export async function downloadVersion(version) {
    console.log("Downloading espruino...");
    let url = "http://www.espruino.com/binaries/" + version;
    let response = await axios({ url: url, responseType: 'arraybuffer' });
    let binary = tmp.fileSync();
    fs.writeFileSync(binary.name, response.data);
    return binary.name;
}