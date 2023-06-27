import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import tmp from 'tmp';
import path from 'path';

export async function getLatestVersion(platformSelector) {
    console.log("[ espruino ] Get latest version from espruino.com...");
    let response = await axios(global.appConfig.espruino_binaries_apache_index);
    let document = new JSDOM(response.data).window.document;
    let versions = [...document.querySelectorAll(platformSelector)].map(a => a.textContent);
    versions = versions.sort((a, b) => a > b ? -1 : 1);
    let latest = versions[0];
    console.log("[ espruino ] Latest version: " + latest.split("_")[1]);
    return {
        versions: versions,
        latest: latest,
        latestShort: latest.split("_")[1]
    }
}

export async function downloadVersion(version) {
    console.log(`[ espruino ] Download file ${version}...`);
    let url = global.appConfig.espruino_binaries_apache_index + version;
    let response = await axios({ url: url, responseType: 'arraybuffer' });
    console.log(`[ espruino ] Done.`);
    let binary = tmp.fileSync();
    fs.writeFileSync(binary.name, response.data);
    return binary.name;
}