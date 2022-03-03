# MicroFlash
MicroFlash is an easy and interactive way to flash Espruino onto a NodeMCU or ESP8266. MicroFlash contains:
- Custom Esptool management system to always have the latest version of esptool.
- A simple command line interface to flash the device.
- Automatic downloads of the latest version of espruino for the device.

Why MicroFlash?

Mainly, for beginners, using Esptool with file offsets and split files is pretty painful. Not only that, having to update espruino
but not remembering the exact offsets was just too much of a hassle. MicroFlash takes care of all of that for you and simply
presents you with a 4 question setup to get started.

Is it slower?

No, in fact, MicroFlash is a lot faster than the standard Esptool because it runs on a 4x faster baud rate for non windows machines and
up to 2x baud rate faster on windows machines.

Is it reliable?

Since MicroFlash uses Esptool to flash the device, it is very reliable. Esptool is created by the same developers who created the ESP8266.

## Getting started

Start by cloning this repository, you can either:
- Press the green code button on the top right to download the repository as a zip.
- Use your local git client to clone the repository.
- SSH into github and download it from there.

The easiest is the first option. Simply download the zip and extract it.

Next you need to make sure you have node.js installed. If not, you can download it from [here](https://nodejs.org/en/download/).

Once completed, first time configuration for node.js is still required.

Run the following command to download Facebook's package manager for node.js:
```bash
npm install -g yarn
```
or in some cases you might need sudo
```bash
sudo npm install -g yarn
```

Once that is complete you have node.js installed.

Next, open a terminal (either command prompt, bash, zsh, etc.) and navigate to the directory where you cloned the repository.
Make sure to navigate into the extracted directory.

Next, run the following command to complete the install of MicroFlash:
```bash
yarn install
```

This command should upwards of 10 to 15 seconds to finish.
After which you can simply start up MicroFlash by running the following command:

```bash
yarn start
```
 
This will, if not already installed, install Esptool and then prompt you for basic information like the serial port, baud rate, and espruino version.

After that, MicroFlash will start flashing the device. And voila!