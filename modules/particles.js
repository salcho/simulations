import { Point, getShadowRoot } from '../main.js';

class Particle {
    constructor(isUserControlled = false, color, position, velocity, isTainted = false) {
        this.position = position;
        // all particles start with at rest
        this.velocity = velocity;
        this.mass = 1;
        this.color = color;
        this.isUserControlled = isUserControlled;
        this.isTainted = isTainted;
        this.ctx = ctx;
    }

    draw() {
        this.ctx.fillStyle = this.color;
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.arc(this.position.x, this.position.y, getRadius(), 0, Math.PI * 2, false);
        this.ctx.fill();

        // draw the velocity vector
        this.ctx.strokeStyle = 'black';
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineTo(this.position.x + this.velocity.x, this.position.y + this.velocity.y);
        this.ctx.stroke();

        // draw the x component of the velocity vector
        this.ctx.strokeStyle = 'blue';
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineTo(this.position.x + this.velocity.x, this.position.y);
        this.ctx.stroke();

        // draw the y component of the velocity vector
        this.ctx.strokeStyle = 'yellow';
        this.ctx.beginPath();
        this.ctx.moveTo(this.position.x, this.position.y);
        this.ctx.lineTo(this.position.x, this.position.y + this.velocity.y);
        this.ctx.stroke();
    }

    // accelerate the particle in the x direction by adding x to its velocity
    pushX(x) {
        this.velocity.x += x;
    }

    // accelerate the particle in the y direction by adding y to its velocity
    pushY(y) {
        this.velocity.y += y;
    }
}

function startparticles() {
    if (hasStarted) {
        return;
    }
    hasStarted = true;
    stop = false;
    shadowRoot.querySelector('#start').disabled = true;
    requestAnimationFrame(mainLoop);
}

function resetparticles() {
    stop = true;
    gameOver = false;
    currentTime = 0;
    let isGameMode = shadowRoot.querySelector('#gameMode').checked;
    makeParticles(parseInt(shadowRoot.querySelector('#numberOfParticles').value), isGameMode);
    draw();
}

// particle radius
let radius = 30;
// friction coefficient
let friction = 0.9;
let gameMode = false;
let gameOver = false;
let hasStarted = false;
let currentTime = 0;
let particles = [];
let stop = false;
const Direction = {
    Left: 0,
    Right: 1,
    Up: 2,
    Down: 3,
    Pause: 4,
}
let direction = null;

const shadowRoot = getShadowRoot('particles');
const canvas = shadowRoot.querySelector('canvas');
const ctx = canvas.getContext('2d');

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Third law of motion - for every action, there is an equal and opposite reaction
// When the particle hits the wall, the wall pushes back on the particle
function boundsCheck(particle) {
    if (particle.position.x < radius) {
        particle.position.x = radius;
        particle.velocity.x = -particle.velocity.x;
    }
    if (particle.position.x > canvas.width - radius) {
        particle.position.x = canvas.width - radius;
        particle.velocity.x = -particle.velocity.x;
    }
    if (particle.position.y < radius) {
        particle.position.y = radius;
        particle.velocity.y = -particle.velocity.y;
    }
    if (particle.position.y > canvas.height - radius) {
        particle.position.y = canvas.height - radius;
        particle.velocity.y = -particle.velocity.y;
    }
}

function mainLoop() {
    if (shadowRoot.querySelector('.particles').classList.contains('hidden')) {
        return;
    }

    if (stop) {
        requestAnimationFrame(mainLoop);
        return;
    }
    clear();

    particles.forEach(particle => {
        if (particle.isUserControlled) {
            switch (direction) {
                case Direction.Left:
                    particle.pushX(-1);
                    break;
                case Direction.Right:
                    particle.pushX(1);
                    break;
                case Direction.Up:
                    particle.pushY(-1);
                    break;
                case Direction.Down:
                    particle.pushY(1);
                    break;
            }
        }

        particle.position.x += particle.velocity.x * (1 - friction);
        particle.position.y += particle.velocity.y * (1 - friction);

        boundsCheck(particle);

        // collision detection with other particles
        particles.forEach(other => {
            if (other === particle) {
                return;
            }
            const dx = other.position.x - particle.position.x;
            const dy = other.position.y - particle.position.y;

            const distance = Math.sqrt(dx * dx + dy * dy);
            // https://www.khanacademy.org/science/physics/linear-momentum/elastic-and-inelastic-collisions/a/what-are-elastic-and-inelastic-collisions
            if (distance < 2 * radius) {
                if (gameMode) {
                    function getVelocity(particle) {
                        return Math.sqrt(particle.velocity.x ** 2 + particle.velocity.y ** 2);
                    }
                    const tainted = particle.isTainted ? particle : other;
                    const notTainted = particle.isTainted ? other : particle;
                    const userControlled = particle.isUserControlled ? particle : other;
                    const notUserControlled = particle.isUserControlled ? other : particle;

                    const oneIsTainted = particle.isTainted || other.isTainted;
                    const oneIsUserControlled = particle.isUserControlled || other.isUserControlled;
                    const oneIsGreen = particle.color === 'green' || other.color === 'green';
                    if (oneIsTainted && oneIsGreen && getVelocity(tainted) > getVelocity(notTainted)) {
                        particles = particles.filter(p => p !== other);
                        return;
                    }

                    if (oneIsGreen && oneIsUserControlled && getVelocity(userControlled) > getVelocity(notUserControlled)) {
                        particles = particles.filter(p => p !== notUserControlled);
                        return;
                    }

                    if (oneIsTainted && oneIsUserControlled) {
                        if (getVelocity(tainted) >= getVelocity(notTainted)) {
                            gameOver = true;
                        } else {
                            tainted.isTainted = false;
                            tainted.color = 'green';
                        }
                    }

                    if (!particles.find(p => p.isTainted)) {
                        // pick a random particle except the user controlled one
                        const newTainted = particles.find(p => !p.isUserControlled && p.color !== 'green');
                        if (newTainted) {
                            newTainted.isTainted = true;
                            newTainted.color = 'white';
                        }
                    }
                }
                // the normal is the direction from the center of the particle to the center of the other particle
                // this is the direction along which the particles will be moved away from each other
                const normalX = dx / distance;
                const normalY = dy / distance;
                const overlap = 2 * radius - distance;
                // both particles are moved away from each other by half the overlap
                particle.position.x -= overlap / 2 * normalX;
                particle.position.y -= overlap / 2 * normalY;
                other.position.x += overlap / 2 * normalX;
                other.position.y += overlap / 2 * normalY;

                // the collision will only affect the velocity along the normal
                const relativeVelocityX = particle.velocity.x - other.velocity.x;
                const relativeVelocityY = particle.velocity.y - other.velocity.y;

                // projects the relative velocity onto the direction of the normal
                const dotProduct = relativeVelocityX * normalX + relativeVelocityY * normalY;
                // calculates the impulse that will be applied to each particle
                // impluse = (2 * dotProduct) / (1/m1 + 1/m2)
                const impulse = 2 * dotProduct / (1 / particle.mass + 1 / other.mass);
                particle.velocity.x -= impulse * 1 * normalX;
                particle.velocity.y -= impulse * 1 * normalY;
                other.velocity.x += impulse * 1 * normalX;
                other.velocity.y += impulse * 1 * normalY;
            }
        });

        particle.draw();
        drawStatus();
    });
    currentTime += 1;
    requestAnimationFrame(mainLoop);
}

addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') {
        direction = Direction.Right;
    } else if (event.key === 'ArrowLeft') {
        direction = Direction.Left;
    } else if (event.key === 'ArrowUp') {
        direction = Direction.Up;
    } else if (event.key === 'ArrowDown') {
        direction = Direction.Down;
    } else if (event.key === ' ') {
        direction = Direction.Pause;
        stop = !stop;
        draw();
    }
});

function makeParticles(numberOfParticles, randomVelocity = false) {
    particles = [];
    for (let i = 0; i < numberOfParticles; i++) {
        const isFirstParticle = i === 0;
        const isBlocker = gameMode && Math.random() < 0.7;
        particles.push(new Particle(
            isFirstParticle,
            isFirstParticle ? 'red' : isBlocker ? 'black' : 'green',
            new Point(
                isFirstParticle ? 60 : Math.random() * canvas.width,
                isFirstParticle ? 30 : Math.random() * canvas.height
            ),
            new Point(
                randomVelocity ? Math.random() * 50 : 0,
                randomVelocity ? Math.random() * 50 : 0)));
    }

    if (gameMode) {
        particles.push(new Particle(false, 'white',
            new Point(canvas.width / 2, canvas.height / 2),
            new Point(Math.random() * 50, Math.random() * 50), true));
    }
}

function drawStatus() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'black';
    if (shadowRoot.querySelector('#showTime').checked) {
        ctx.fillText(`Time: ${currentTime}`, 10, canvas.height - 10);
    }

    ctx.fillText(stop ? '⏸' : '▶', canvas.width - 40, canvas.height - 10);

    if (gameMode) {
        if (!particles.find(p => p.color == 'green')) {
            ctx.fillText('You win!', canvas.width / 2, canvas.height / 2);
            stop = true;
            return;
        }

        if (gameOver) {
            ctx.fillText('Game over!', canvas.width / 2, canvas.height / 2);
            stop = true;
        }
    }
}

function draw() {
    clear();
    particles.forEach(particle => particle.draw());
    drawStatus();
}

addEventListener('keyup', _ => {
    direction = null;
});

shadowRoot.querySelector('#friction').addEventListener('input', event => {
    friction = parseFloat(event.target.value);
    shadowRoot.querySelector('#frictionValue').innerText = friction;
});

shadowRoot.querySelector('#showTime').addEventListener('change', event => {
    draw();
});

shadowRoot.querySelector('#particleRadius').addEventListener('input', event => {
    stop = true;
    radius = parseInt(event.target.value);
    shadowRoot.querySelector('#particleRadiusValue').innerText = radius;
    draw();
    stop = false;
});

shadowRoot.querySelector('#numberOfParticles').addEventListener('input', event => {
    stop = true;
    const numberOfParticles = parseInt(event.target.value);
    shadowRoot.querySelector('#numberOfParticlesValue').innerText = numberOfParticles;
    makeParticles(numberOfParticles, true);
    draw();
    stop = false;
});

shadowRoot.querySelector('#mass').addEventListener('input', event => {
    stop = true;
    const mass = parseInt(event.target.value);
    shadowRoot.querySelector('#massValue').innerText = mass;
    particles.find(p => p.isUserControlled).mass = mass;
    draw();
    stop = false;
});

shadowRoot.querySelector('#gameMode').addEventListener('change', event => {
    gameMode = event.target.checked;
    reset();
    draw();
});

// pause/restart the simulation when it is visible
const simulation = shadowRoot.querySelector('#container');
const observer = new IntersectionObserver((entries) => {
    if (!hasStarted) {
        return;
    }
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            requestAnimationFrame(mainLoop);
        } else {
            stop = true;
        }
    });
});

observer.observe(simulation);

function getRadius() {
    return radius;
}

resetparticles();

export { startparticles, resetparticles }