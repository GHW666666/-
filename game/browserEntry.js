import { GameEngine } from './main.js';
import { platform } from './adapter.js';

const engine = new GameEngine();
engine.init();
// A small inspection hook keeps local previews and release checks observable.
window.naiwaGame = engine;
document.documentElement.dataset.naiwaBuild = document.querySelector('[data-naiwa-bundle]')?.dataset.build || 'development';

if (new URLSearchParams(window.location.search).has('autostart')) engine.start();

const bindButton = (id, gesture) => {
    const button = document.getElementById(id);
    if (!button) return;
    const trigger = event => {
        event.preventDefault();
        event.stopPropagation();
        platform.notifyGesture(gesture);
    };
    button.addEventListener('touchstart', trigger, { passive: false });
    button.addEventListener('mousedown', trigger);
};

bindButton('btnLeft', 'swipe_left');
bindButton('btnRight', 'swipe_right');
bindButton('btnJump', 'swipe_up');
bindButton('btnSlide', 'swipe_down');
