let currentStream = null;
let audioCtx = new AudioContext();
let recorder = null;
let urlResolve;
let download = document.createElement('a');

export function startRecord () {
  recorder = new MediaRecorder(currentStream, { mimeType: 'video/webm; codecs=vp9', audio: true});
  recorder.ondataavailable = (e) => {
    console.log('ondataavailable', e.data);
    let url = URL.createObjectURL(e.data);
    if (urlResolve) urlResolve(url);
    else {
      download.href = url;
      download.setAttribute('download', 'a.webm');
      download.click();
    }
  };
  console.log('startRecord');
  recorder.start();
}
export function endRecord () {
  console.log('endRecord');
  recorder.stop();
  currentStream.getTracks().forEach((track) => track.stop());
  return new Promise((resolve) => {
    urlResolve = resolve;
  });
}

export function getWindow (electron, name = 'Electron') {
  if (!electron) throw new Error('electron was required in first param');
  let { desktopCapturer } = electron;
  return new Promise((resolve) => {
    let devicePromise = null;
    let desktopConfig;
    let currentError;
    /*eslint-disable*/
    if (navigator.userAgent.indexOf('Mac') !== -1) {
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
      // 获取屏幕权限
      return desktopCapturer.getSources({
        types: ['screen', 'window']
      });
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
      let desktopAudio = navigator.mediaDevices.getUserMedia(desktopConfig);
      let micAudio = navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      return Promise.allSettled([windowVideo, desktopAudio, micAudio]);
    }).then(([{ value: windowStream }, {　value: desktopStream }, { value: micStream }]) => {
      let desktopSource = desktopStream && audioCtx.createMediaStreamSource(desktopStream);
      let micSource = micStream && audioCtx.createMediaStreamSource(micStream);
      let destination = audioCtx.createMediaStreamDestination();
      if (desktopSource) desktopSource.connect(destination);
      if (micSource) micSource.connect(destination);
      windowStream.addTrack(...destination.stream.getAudioTracks());
      currentStream = windowStream;
      resolve(currentError);
    }).catch(err => currentError = err);
  });
}
