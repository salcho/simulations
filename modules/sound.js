import { getShadowRoot, Point } from "../main.js";

class Sound {
    constructor(context) {
        this.context = context;
        this.now = context.currentTime;
    }

    init() {
        this.oscillator = this.context.createOscillator();
        this.gainNode = this.context.createGain();

        this.oscillator.connect(this.gainNode);
        this.gainNode.connect(this.context.destination);
        this.oscillator.type = 'sine';
    }

    play(value) {
        this.init();

        this.oscillator.frequency.value = value;
        this.gainNode.gain.setValueAtTime(1, this.context.currentTime);

        this.oscillator.start(this.context.currentTime);
        this.stop();
    }

    stop() {
        let time = this.context.currentTime;
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, time + 1);
        this.oscillator.stop(time + 1);
    }
}

class Note {
    constructor(frequency, point) {
        this.frequency = frequency;
        this.dir = directions.RIGHT;
        this.fill = randomFill();
        this.point = point;
    }

}

const shadowRoot = getShadowRoot('sound');
const canvas = shadowRoot.querySelector('canvas');
const ctx = canvas.getContext('2d');
let hasStarted = false;
let wallWidth = 10;
let particleRadius = 30;
const directions = {
    LEFT: 1,
    RIGHT: 2
}
function randomFill() {
    return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

let particles = [
    // C D E F G A B C
    new Note(261.63, new Point(wallWidth + particleRadius + 1, 1 * (particleRadius + 60))),
    new Note(293.66, new Point(wallWidth + particleRadius + 1 * 140, 2 * (particleRadius + 60))),
    new Note(329.63, new Point(wallWidth + particleRadius + 2 * 140, 3 * (particleRadius + 60))),
    new Note(349.23, new Point(wallWidth + particleRadius + 3 * 140, 4 * (particleRadius + 60))),
    new Note(392.00, new Point(wallWidth + particleRadius + 4 * 140, 5 * (particleRadius + 60))),
    new Note(440.00, new Point(wallWidth + particleRadius + 5 * 140, 6 * (particleRadius + 60))),
    new Note(493.88, new Point(wallWidth + particleRadius + 6 * 140, 7 * (particleRadius + 60))),
    new Note(523.25, new Point(wallWidth + particleRadius + 7 * 140, 8 * (particleRadius + 60))),
];

let note;
function startsound() {
    if (hasStarted) {
        return;
    }

    // use the web audio api to play a C sound for 20 seconds
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    note = new Sound(audioCtx);

    hasStarted = true;
    shadowRoot.querySelector('#start').disabled = true;
    requestAnimationFrame(mainLoop);
}

function mainLoop() {
    clear();

    // the walls close in on the particles
    wallWidth += 1;
    if (wallWidth >= canvas.width / 2) {
        return;
    }
    drawWalls();

    particles.forEach(particle => {
        const p = particle.point;
        // check if the particle has hit the wall
        if (p.x + particleRadius >= canvas.width - wallWidth) {
            p.dir = directions.LEFT;
            note.play(particle.frequency);
        } else if (p.x - particleRadius <= wallWidth) {
            p.dir = directions.RIGHT;
            note.play(particle.frequency);
        }

        // move the particles on the x axis
        if (p.dir === directions.LEFT) {
            p.x -= 10;
        }
        else { p.x += 10; }
        // draw the particles
        drawParticles();
    });

    requestAnimationFrame(mainLoop);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawWalls() {
    // make a wall in the form of a rectangle on the left side of the canvas
    ctx.beginPath();
    ctx.rect(0, 0, wallWidth, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();

    // make another wall in the form of a rectangle on the right side of the canvas
    ctx.beginPath();
    ctx.rect(canvas.width - wallWidth, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
}

function drawParticles() {
    // draw the particles
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.point.x, p.point.y, particleRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.fill;
        ctx.fill();
        ctx.closePath();
    });
}

function resetsound() {
    clear();

    wallWidth = 10;
    drawWalls();
    drawParticles();
}

resetsound();

export { startsound, resetsound };