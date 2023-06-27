import inquirer from 'inquirer';
import { init } from './src/downloadesptool.js';
import { SerialPort } from 'serialport';
import { getLatestVersion, downloadVersion } from './src/espruinotool.js';
import { spawn } from 'child_process';
import { getAppConfiguration, changeSetting } from './src/appconfig.js';

await getAppConfiguration();

console.clear();
let logo = `  __  __ _____ _____ _____   ____  ______ _                _____ _    _ 
|  \\/  |_   _/ ____|  __ \\ / __ \\|  ____| |        /\\    / ____| |  | |
| \\  / | | || |    | |__) | |  | | |__  | |       /  \\  | (___ | |__| |
| |\\/| | | || |    |  _  /| |  | |  __| | |      / /\\ \\  \\___ \\|  __  |
| |  | |_| || |____| | \\ \\| |__| | |    | |____ / ____ \\ ____) | |  | |
|_|  |_|_____\\_____|_|  \\_\\\\____/|_|    |______/_/    \\_|_____/|_|  |_|`;
console.log(logo + "\n");
console.log("MicroFlash by Microart, Copyright (c) " + new Date().getFullYear() + " Microart Inc. All rights reserved.\n\n");

await init();

console.log("\nWelcome to MicroFlash!");
let menu = await inquirer.prompt([
    {
        type: "list",
        name: "option",
        message: "What do you want to do?",
        choices: [
            {
                name: "Flash espruino",
                value: 0
            },
            {
                name: "Update esptool",
                value: 1
            },
            {
                name: "Modify the config file",
                value: 2
            },
            new inquirer.Separator(),
            {
                name: "Exit",
                value: 3
            }
        ]
    }
]);

if (menu.option === 3) process.exit(0);
if (menu.option === 1) {
    await init();
    process.exit(0);
}

if (menu.option === 2) {
    let config = await inquirer.prompt([
        {
            type: "input",
            name: "espruino_binaries_apache_index",
            message: "Enter the url of espruino binaries apache index:",
            default: global.appConfig.espruino_binaries_apache_index
        },
        {
            type: "input",
            name: "esptool_github_releases_manifest",
            message: "Enter the url of esptool github releases manifest:",
            default: global.appConfig.esptool_github_releases_manifest
        }
    ]);
    await changeSetting("espruino_binaries_apache_index", config.espruino_binaries_apache_index);
    await changeSetting("esptool_github_releases_manifest", config.esptool_github_releases_manifest);
    process.exit(0);
}

let flashConfig = {};

let ports = await SerialPort.list();

let answers = await inquirer.prompt([
    {
        type: "list",
        name: "device",
        message: "Choose serial device",
        choices: ports.map((port, index) => {
            return {
                name: port.path,
                value: index
            }
        })
    }
]);

let selectedport = ports[answers.device];
flashConfig.port = selectedport;

let baud = await inquirer.prompt([
    {
        type: "list",
        name: "rate",
        message: "Choose baud rate",
        choices: [
            9600,
            19200,
            38400,
            57600,
            96000,
            115200,
            process.platform === "win32" ? "230400 (Recommended)" : 230400,
            process.platform !== "win32" ? "460800 (Recommended)" : 460800
        ]
    }
]);

flashConfig.baudrate = parseInt(baud.rate);

let platformSelector = await inquirer.prompt([
    {
        type: "list",
        name: "platform",
        message: "Choose a platform",
        choices: Object.values(global.appConfig.platforms).map(value => ({
            name: value.name,
            value: value
        }))
    }
]);

let versions = await getLatestVersion(platformSelector.platform.selector);

let version = await inquirer.prompt([
    {
        type: "list",
        name: "selected",
        message: "Choose espruino version",
        choices: versions.versions.map((version, index) => {
            let short = version.split("_")[1];
            return {
                name: index === 0 ? short + " (Latest Release)" : short,
                value: index
            }
        })
    }
]);

let selectedVersion = versions.versions[version.selected];

flashConfig.version = selectedVersion;

let confirmFlash = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: `Are you sure you want to flash Espruino ${flashConfig.version.split("_")[1]} ${platformSelector.platform.name} to ${flashConfig.port.path} at ${flashConfig.baudrate} baud?
This will erase all existing data on the device.`
});

if (confirmFlash.confirm) {
    console.log("Flashing espruino...");
    let binary = await downloadVersion(selectedVersion);
    let args = [
        "--port", flashConfig.port.path,
        "--baud", flashConfig.baudrate,
        "write_flash",
        "-fm", "dio",
        "--flash_size", "detect",
        "0",
        binary
    ];
    let proc = spawn("bin/esptool", args);
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('close', () => {
        process.exit(0);
    });
    proc.on('error', () => {
        console.log("Error flashing espruino");
    });
} else {
    process.exit(0);
}