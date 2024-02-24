const gravityClosure = (_ => {
    const parent = document.querySelector('simulation-elem[name="gravity"]');
    const gravityCanvas = parent.shadowRoot.querySelector('canvas');
    const gravityCtx = gravityCanvas.getContext('2d');
    let hasStarted = false;

    function clear() {
        gravityCtx.clearRect(0, 0, gravityCanvas.width, gravityCanvas.height);
        // make the canvas light grey
        gravityCtx.fillStyle = 'darkkhaki';
        gravityCtx.fillRect(0, 0, gravityCanvas.width, gravityCanvas.height);
    }

    class Planet {
        constructor(distanceSun, y, radius, mass, color, name) {
            this.x = name == 'sun' ? 0 : scaleDistanceFromSun(distanceSun) + radiusSun;
            this.y = y;
            this.radius = radius;
            this.mass = mass;
            this.color = color;
            this.velocity = { x: 0, y: 0 };
            this.name = name;
        }


        inverseMassScale(mass) {
            return mass * 1.989e30 / 100;
        }


        draw() {
            gravityCtx.beginPath();
            gravityCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            gravityCtx.fillStyle = this.color;
            gravityCtx.fill();
            gravityCtx.closePath();

            // display the name and mass of the planet on top of the circle
            gravityCtx.font = "10px Arial";
            gravityCtx.fillStyle = "black";
            gravityCtx.textAlign = "center";
            gravityCtx.fillText(this.name, this.x, this.y - this.radius - 5);
            gravityCtx.fillText(this.x, this.x, this.y + this.radius + 15);

            // draw an orbit for the planet
            gravityCtx.beginPath();
            gravityCtx.arc(0, gravityCanvas.height / 2, this.x, 0, Math.PI * 2);
            gravityCtx.strokeStyle = "dimgrey";
            gravityCtx.stroke();
            gravityCtx.closePath();
        }
    }

    // represents the radius of the sun (actual 696,340 km) as 100 pixels and 
    // the radius of the planets as a fraction of the sun's radius
    function scaleRadius(radius) {
        return radius * 150 / 696340;
    }
    const radiusSun = scaleRadius(696340);

    // since pluto is 5.9 billion km from the sun, we scale it to the width of the canvas
    function scaleDistanceFromSun(distance) {
        return (distance * (gravityCanvas.width - radiusSun) / 5_900);
    }

    // since the mass of the sun is 1.989 * 10^30 kg, we scale it to 100
    function scaleMass(mass) {
        return mass * 100 / 1.989e30;
    }

    function mainLoop() {
        gravityClosure.clear();
        gravityClosure.planets.forEach(planet => {
            // compute the gravitational force between this planet and all others
            gravityClosure.planets.forEach(other => {
                if (other === planet) {
                    return;
                }
                const G = 6.674 * Math.pow(10, -11);
                const distance = Math.abs(planet.x - other.x);
                // F = G * m1 * m2 / r^2
                const force = G * planet.mass * other.mass / Math.pow(distance, 2);
                // compute the acceleration of the planet
                // F = m * a => a = F / m
                const acceleration = force / planet.mass;
                // compute the new position of the planet
                // v = a * t
                // x = x0 + v * t
                other.x += acceleration;
            });

            planet.draw()
        });

        requestAnimationFrame(mainLoop);
    }

    const planets = [
        // sun => r = 696,340 km, distance from sun = 0 km, mass = 1.989 * 10^30 kg
        new Planet(0, gravityCanvas.height / 2, radiusSun, scaleMass(1.989e30), 'yellow', 'sun'),
        // mercury => r = 2,439.7 km, distance from sun = 57.9 million km, mass = 3.285 * 10^23 kg
        new Planet(57.9, gravityCanvas.height / 2, scaleRadius(2439), scaleMass(3.285e23), 'black', 'mercury'),
        // venus => r = 6,051.8 km, distance from sun = 108.2 million km, mass = 4.867 * 10^24 kg
        new Planet(108.2, gravityCanvas.height / 2, scaleRadius(6051), scaleMass(4.867e24), 'orange', 'venus'),
        // earth => r = 6,371 km, distance from sun = 149.6 million km, mass = 5.972 * 10^24 kg
        new Planet(149.6, gravityCanvas.height / 2, scaleRadius(6371), scaleMass(5.972e24), 'blue', 'earth'),
        // mars => r = 3,389.5 km, distance from sun = 227.9 million km, mass = 6.39 * 10^23 kg
        new Planet(227.9, gravityCanvas.height / 2, scaleRadius(3389), scaleMass(6.39e23), 'red', 'mars'),
        // jupiter => r = 69,911 km, distance from sun = 778.5 million km, mass = 1.898 * 10^27 kg
        new Planet(778.5, gravityCanvas.height / 2, scaleRadius(69911), scaleMass(1.898e27), 'brown', 'jupiter'),
        // saturn => r = 58,232 km, distance from sun = 1.4 billion km, mass = 5.683 * 10^26 kg
        new Planet(1_400, gravityCanvas.height / 2, scaleRadius(58232), scaleMass(5.683e26), 'purple', 'saturn'),
        // uranus => r = 25,362 km, distance from sun = 2.9 billion km, mass = 8.681 * 10^25 kg
        new Planet(2_900, gravityCanvas.height / 2, scaleRadius(25362), scaleMass(8.681e25), 'lightblue', 'uranus'),
        // neptune => r = 24,622 km, distance from sun = 4.5 billion km, mass = 1.024 * 10^26 kg
        new Planet(4_500, gravityCanvas.height / 2, scaleRadius(24622), scaleMass(1.024e26), 'darkblue', 'neptune'),
        // pluto => r = 1,188.3 km, distance from sun = 5.9 billion km, mass = 1.309 * 10^22 kg
        new Planet(5_900, gravityCanvas.height / 2, scaleRadius(1188), scaleMass(1.309e22), 'darksalmon', 'pluto'),
    ];

    return {
        clear,
        planets,
        mainLoop,
        parent
    };
})();

gravityClosure.clear();
gravityClosure.planets.forEach(planet => { planet.draw() });

function startgravity() {
    if (gravityClosure.hasStarted) {
        return;
    }
    gravityClosure.hasStarted = true;
    gravityClosure.stop = false;
    gravityClosure.parent.shadowRoot.querySelector('#start').disabled = true;
    requestAnimationFrame(gravityClosure.mainLoop);
}