// Offline original composition renderer. No runtime dependency or remote service.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import score from './naiwa-music-score.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sampleRate = 44100;
const secondsPerBeat = 60 / score.bpm;
const frames = Math.round(score.totalBeats * secondsPerBeat * sampleRate);
const left = new Float32Array(frames), right = new Float32Array(frames);
const wetLeft = new Float32Array(frames), wetRight = new Float32Array(frames);
let seed = 20261007;
const noise = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2147483648 - 1; };
const sine = Math.sin, tau = 2 * Math.PI;
const instrumentGain = { marimba: .68, pluck: .85, bass: .84, pad: .48, bell: .7, kick: .85, snare: .92, hat: .65, shaker: .55 };

for (const event of score.events) {
    const { instrument, velocity, pan, midi } = event;
    const hold = event.durationBeats * secondsPerBeat;
    const tail = ['pad', 'bell'].includes(instrument) ? .65 : instrument === 'marimba' ? .23 : .12;
    const length = hold + tail;
    const samples = Math.ceil(length * sampleRate);
    const start = Math.round(event.startBeat * secondsPerBeat * sampleRate);
    const frequency = 440 * 2 ** ((midi - 69) / 12);
    const amplitude = velocity * instrumentGain[instrument];
    const panL = Math.sqrt((1 - pan) * .5), panR = Math.sqrt((1 + pan) * .5);
    const reverb = { marimba: .16, pluck: .13, pad: .22, bell: .25 }[instrument] || 0;
    let lowNoise = 0, previousNoise = 0;
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate, phase = tau * frequency * t;
        const attack = instrument === 'pad' ? .12 : instrument === 'bass' ? .008 : .0025;
        const release = instrument === 'pad' ? .58 : tail;
        const gate = Math.min(1, t / attack) * Math.min(1, (length - t) / release);
        let value = 0;
        switch (instrument) {
            case 'marimba':
                value = (.90 * sine(phase) * Math.exp(-t / (.18 + hold * .32))
                    + .19 * sine(phase * 4) * Math.exp(-t / .045)
                    + .045 * sine(phase * 9.7) * Math.exp(-t / .021));
                break;
            case 'pluck':
                // Mellow acoustic-style pluck, with a short bright pick transient.
                value = (sine(phase) + .26 * sine(phase * 2) + .13 * sine(phase * 3)
                    + .045 * sine(phase * 5) * Math.exp(-t / .06)) * Math.exp(-t / (.14 + hold * .32));
                break;
            case 'bass':
                value = (sine(phase) + .19 * sine(phase * 2) + .06 * sine(phase * 3))
                    * (.75 + .25 * Math.exp(-t / .15)) * Math.exp(-t / Math.max(.25, hold));
                break;
            case 'pad':
                value = (.73 * sine(phase) + .16 * sine(phase * 1.0025) + .10 * sine(phase * 2))
                    * (.92 + .08 * sine(tau * .6 * t));
                break;
            case 'bell':
                value = (.82 * sine(phase) * Math.exp(-t / .38)
                    + .21 * sine(phase * 2.76) * Math.exp(-t / .13));
                break;
            case 'kick': {
                const kickPhase = tau * (46 * t + 58 * .028 * (1 - Math.exp(-t / .028)));
                value = sine(kickPhase) * Math.exp(-t / .065);
                break;
            }
            case 'snare': {
                const random = noise(); lowNoise += .18 * (random - lowNoise);
                value = .50 * (random - lowNoise) * Math.exp(-t / .033)
                    + .23 * sine(tau * 185 * t) * Math.exp(-t / .035);
                break;
            }
            case 'hat': {
                const random = noise();
                value = .38 * (random - previousNoise) * Math.exp(-t / .020); previousNoise = random;
                break;
            }
            case 'shaker': {
                const random = noise(); lowNoise += .28 * (random - lowNoise);
                value = .50 * (random - lowNoise) * Math.sin(Math.PI * Math.min(1, t / Math.max(.01, hold))) * Math.exp(-t / .058);
                break;
            }
            default: throw new Error(`Unknown instrument ${instrument}`);
        }
        value *= gate * amplitude;
        const index = (start + i) % frames; // Release tails continue into the next loop.
        left[index] += value * panL; right[index] += value * panR;
        wetLeft[index] += value * panL * reverb; wetRight[index] += value * panR * reverb;
    }
}

// A small, diffuse room rather than a long reverberant wash. Circular taps make
// the musical loop periodic and avoid cutting the last note at the boundary.
for (const [delay, gain] of [[.043,.38],[.079,.28],[.131,.21],[.193,.16],[.277,.12],[.361,.075]]) {
    const offset = Math.round(delay * sampleRate);
    for (let i = 0; i < frames; i++) {
        const source = (i - offset + frames) % frames;
        left[i] += wetRight[source] * gain; right[i] += wetLeft[source] * gain;
    }
}

// Gentle top-end smoothing; two passes around the loop settle the filter.
const cutoff = 14500, coefficient = 1 - Math.exp(-tau * cutoff / sampleRate);
for (const channel of [left, right]) {
    let state = 0;
    for (let lap = 0; lap < 2; lap++) {
        for (let i = 0; i < frames; i++) {
            state += coefficient * (channel[i] - state);
            if (lap === 1) channel[i] = state;
        }
    }
    const mean = channel.reduce((sum, sample) => sum + sample, 0) / frames;
    for (let i = 0; i < frames; i++) channel[i] -= mean;
}
let peak = 0, squareSum = 0;
for (let i = 0; i < frames; i++) {
    peak = Math.max(peak, Math.abs(left[i]), Math.abs(right[i]));
    squareSum += left[i] ** 2 + right[i] ** 2;
}
const masterGain = .82 / peak;
const wav = Buffer.alloc(44 + frames * 4);
wav.write('RIFF',0); wav.writeUInt32LE(wav.length - 8,4); wav.write('WAVE',8);
wav.write('fmt ',12); wav.writeUInt32LE(16,16); wav.writeUInt16LE(1,20);
wav.writeUInt16LE(2,22); wav.writeUInt32LE(sampleRate,24); wav.writeUInt32LE(sampleRate * 4,28);
wav.writeUInt16LE(4,32); wav.writeUInt16LE(16,34); wav.write('data',36); wav.writeUInt32LE(frames * 4,40);
for (let i = 0; i < frames; i++) {
    wav.writeInt16LE(Math.round(left[i] * masterGain * 32767),44 + i * 4);
    wav.writeInt16LE(Math.round(right[i] * masterGain * 32767),46 + i * 4);
}
const previewDir = path.join(root,'output','music'), assetDir = path.join(root,'assets','audio');
await fs.mkdir(previewDir,{recursive:true}); await fs.mkdir(assetDir,{recursive:true});
const wavPath = path.join(previewDir,'naiwa-sunny-run.wav');
const mp3Path = path.join(assetDir,'naiwa-sunny-run.mp3');
await fs.writeFile(wavPath,wav);
const argument = process.argv.indexOf('--ffmpeg');
const ffmpeg = argument >= 0 ? process.argv[argument + 1] : process.env.NAIWA_FFMPEG || 'ffmpeg';
const result = spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',wavPath,
    '-codec:a','libmp3lame','-b:a','128k','-ar',String(sampleRate),'-write_xing','1',
    '-metadata',`title=${score.title}`,'-metadata','artist=Naiwa Runner',mp3Path],{encoding:'utf8'});
if (result.error || result.status !== 0) throw new Error(`MP3 export failed. Set NAIWA_FFMPEG or use --ffmpeg <path>. ${result.error?.message || result.stderr}`);
const info = {
    title:score.title, description:score.description, creation:'Original composition and offline procedural instrument synthesis',
    bpm:score.bpm,key:score.key,bars:score.bars,durationSeconds:frames/sampleRate,sampleRate,channels:2,
    sourceWav:'output/music/naiwa-sunny-run.wav',gameAsset:'assets/audio/naiwa-sunny-run.mp3',
    mp3Bytes:(await fs.stat(mp3Path)).size,bitrateKbps:128,
    peakDb:20*Math.log10(.82),rmsDb:20*Math.log10(Math.sqrt(squareSum/(frames*2))*masterGain),
    loopBoundaryDifference:[Math.abs(left[0]-left[frames-1])*masterGain,Math.abs(right[0]-right[frames-1])*masterGain],
};
await fs.writeFile(path.join(assetDir,'naiwa-sunny-run.json'),JSON.stringify(info,null,2)+'\n');
console.log(JSON.stringify(info,null,2));
