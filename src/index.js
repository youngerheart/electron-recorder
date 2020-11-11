let currentStream = null;
let audioCtx = new AudioContext();
let recorder = null;
let download = document.createElement('a');

export function startRecord (urlResolve, timeout) {
  recorder = new MediaRecorder(currentStream, { mimeType: 'video/webm; codecs=vp9', audio: true});
  let chunks = [];
  recorder.ondataavailable = (e) => {
    console.log('ondataavailable');
    chunks.push(e.data);
    let url = URL.createObjectURL(new Blob(chunks, { type : 'video/webm; codecs=vp9' }));
    if (urlResolve) urlResolve(url);
    else {
      download.href = url;
      download.setAttribute('download', 'a.webm');
      download.click();
    }
  };
  recorder.start(timeout || 10000);
}
export function endRecord () {
  console.log('endRecord');
  recorder.stop();
  currentStream.getTracks().forEach((track) => track.stop());
}

export function getWindow (electron, name) {
  if (!electron) throw new Error('electron was required in first param');
  let { desktopCapturer } = electron;
  return new Promise((resolve, reject) => {
    let devicePromise = null;
    let desktopConfig;
    /*eslint-disable*/
    if (navigator.userAgent.indexOf('Mac') !== -1) {
      devicePromise = navigator.mediaDevices.enumerateDevices().then((devices) => {
        let device = devices.filter((device) => device.kind === 'audiooutput' && device.label === 'Soundflower (2ch)' && device.deviceId != 'default')[0];
        if (device) {
          desktopConfig = {
            audio: {
              deviceId: device.deviceId
            }
          };
        }
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
      // if (!selectSource) return [];
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
      let desktopAudio = desktopConfig ? navigator.mediaDevices.getUserMedia(desktopConfig) : Promise.resolve(false);
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
      resolve({
        mic: !!micSource,
        desktop: !!desktopSource
      });
    }).catch(reject);
  });
}
