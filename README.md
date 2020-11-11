# electron-screen-recorder
[![NPM version](https://img.shields.io/npm/v/@youngerheart/electron-recorder.svg?sanitize=true)](https://www.npmjs.com/package/@youngerheart/electron-recorder)
[![Downloads](https://img.shields.io/npm/dm/@youngerheart/electron-recorder.svg)](http://badge.fury.io/js/@youngerheart/electron-recorder)
<p>a simple screen recorder for electron, be used to cupture video for screen/window and audio for desktop/mic, support win/mac</p>
<div>
<img src="https://raw.githubusercontent.com/youngerheart/electron-recorder/master/recorder.png" title="electron-recorder" width="160px">
</div>

## usage
```js
// install
npm i @youngerheart/electron-recorder -S

import { getWindow, startRecord, endRecord } from '@youngerheart/electron-recorder'

/**
 * initialize the MediaStream object with
 * an application window's video track
 * a audio track from merged desktop audio track and mic audio track
 * @params {Object} electron: the module object of electron
 * @params {String} name: the name of the window, capture main desktop while param undefined
 * @return {Object} promise: the promise object for result
 * @thenParams {Boolean} mic: existing mic audio track
 * @thenParams {Boolean} desktop: existing desktop audio track
 * @catchParams {Object} error: catched Error object
 */
let promise = getWindow(electron, 'yourWindowName').then(({ mic, desktop }) => {
  if (!mic) console.log('mic audio track was blocked, please check your devices')
  if (!desktop) console.log('desktop audio track was blocked, please check your devices')
}).catch(error => console.log(error))

/**
 * need to be call after getWindow finished
 * start record the media (webm formatted)
 * @params {Object} callback: return the blob file's object url
 * @params {Number} timeout: handle the file url per millisecond(default is 10000ms)
 */
startRecord((url) => {
  ipcRenderer.send('download', url)
}, timeout);

/**
 * need to be call after record started
 */
endRecord()

// main process
ipcMain.on('download', (target, url) => {
  targetWin.webContents.downloadURL(url) // start download...
})
```

## develop

```
git clone
npm i
npm run dev
```
and require the js file at http://localhost:8080/index.js
