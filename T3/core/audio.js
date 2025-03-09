import * as THREE from    '../../build/three.module.js';
import Conf from './conf.js';

let audioListener = null;
let audioLoader = null;


const audioList = [
    {name: 'break', filename: 'table-smash-47690.mp3', buffer: null, sound: null, autoPlay: false, interval: null},
    {name: 'music1', filename: 'smooth-684-cm-54202.mp3', buffer: null, sound: null, autoPlay: true, interval: null}
];

function init(camera) {
    if (!audioListener) {
        audioListener = new THREE.AudioListener();
        audioLoader = new THREE.AudioLoader();

        camera.add(audioListener);
    }

    loadAll();
}


function loadAll() {
    audioList.forEach((info) => {
        const url = `${Conf.AUDIO_PATH}${info.filename}`;
        audioLoader.load(url, function(buffer) {
            console.log(`Audio "${info.filename}" loaded`);

            info.buffer = buffer;
                const sound = new THREE.Audio(audioListener);
                info.sound = sound;
                sound.setBuffer(buffer);
                sound.setVolume(0.3);

                if (info.autoPlay) {
                    sound.setLoop(true);
                    sound.setVolume(0.3);
                    //sound.play();
                }
        });
    });
}

function playEffect(effectName) {
    const info = audioList.find((info) => info.name === effectName);
    console.log (info);
    if (info && info.buffer) {
        info.sound.stop();
        info.sound.play();
/*        const audio = new THREE.Audio(audioListener);
        audio.setBuffer (info.buffer);
        audio.setLoop (false);
        audio.setVolume(0.5);
        audio.play();

        audio.onEnded = () => {
            audio.stop();
            audio.disconnect();
        };*/
    }
}

function toggle(soundName) {
    const info = audioList.find((info) => info.name === soundName);

    if (info) {
        if (info.sound?.isPlaying) {
            info.sound.pause();
        } else {
            play(info);
        }
    }
}

function play(info) {
    if (info.buffer && info.sound) {
        info.sound.play();
        return;
    }

    if (info.interval)
        return;

    info.interval = setInterval(() => {
        if (info.buffer && info.sound) {
            info.sound.play();
            clearInterval(info.interval);
        }
    }, 100);
}


export default {
    init,
    loadAll,
    playEffect,
    toggle
};
