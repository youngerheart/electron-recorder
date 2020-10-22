import { desktopCapturer } from 'electron'
export function isMac () {
  return os.type().toLowerCase().indexOf('darwin') !== -1;
}

// 获取屏幕权限
export function getWindowAccess () {
  return desktopCapturer.getSources({
    types: ['screen', 'window']
  });
}

let desktopConfig;
let stream = null;
let audioCtx = new AudioContext();
let recorder = null;
let chunk = null;
let download = document.createElement('a');

function handleError (e) {
  console.error(e);
  // exit
}

export function startRecord () {
  recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9', audio: true});
  recorder.ondataavailable = (e) => {
    console.log('ondataavailable', e.data);
    chunk = e.data;
    download.href = URL.createObjectURL(chunk);
    download.setAttribute('download', 'a.webm');
    download.click();
  };
  console.log('startRecord');
  recorder.start();
  setTimeout(endRecord, 5000);
}
export function endRecord () {
  console.log('endRecord');
  recorder.stop();
}

export function getWindow (name) {
  return new Promise((resolve) => {
    let devicePromise = null;
    if (isMac) {
      devicePromise = navigator.mediaDevices.enumerateDevices().then((devices) => {
        let device = devices.filter((device) => device.kind === 'audiooutput' && device.label === 'Soundflower (2ch)' && device.deviceId != 'default')[0];
        desktopConfig = {
          audio: {
            deviceId: device && device.deviceId
          }
        };
      });
    } else {
      desktopConfig = {
        audio: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        },
        video: {
          mandatory: {
            chromeMediaSource: 'desktop'
          }
        }
      };
    }
    Promise.resolve(devicePromise).then(() => {
      return getWindowAccess();
    }).then((sources) => {
      // 做筛选
      let selectSource = sources.filter((source) => source.name === name)[0];
      if (!selectSource) return [];
      // 同时捕获画面/系统内部声音/麦克风
      let windowVideo = navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: selectSource ? selectSource.id : 'screen:0:0',
            minWidth: 1280,
            minHeight: 720,
            maxWidth: 1280,
            maxHeight: 720
          }
        }
      });
      console.error(desktopConfig);
      let desktopAudio = navigator.mediaDevices.getUserMedia(desktopConfig);
      let micAudio = navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      return Promise.all([windowVideo, desktopAudio, micAudio]);
    }).then(([windowStream, desktopStream, micStream]) => {
      let desktopSource = audioCtx.createMediaStreamSource(desktopStream);
      let micSource = audioCtx.createMediaStreamSource(micStream);
      let destination = audioCtx.createMediaStreamDestination();
      desktopSource.connect(destination);
      micSource.connect(destination);
      windowStream.addTrack(...destination.stream.getAudioTracks());
      stream = windowStream;
      // console.log(stream);
      resolve();
    }).catch(handleError);
  });
}
