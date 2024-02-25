import { Point, getShadowRoot } from '../main.js';

const shadowRoot = getShadowRoot('chaos');
const chaosCanvas = shadowRoot.querySelector('canvas');
const chaosCtx = chaosCanvas.getContext('2d');
const middleX = chaosCanvas.width / 2;
const middleY = chaosCanvas.height / 2;
const hexagonSide = 400;
const hexagonHeight = Math.sqrt(3) * hexagonSide / 2;
let rValue = 0.5;
let iterations = 10000;
let instant = false;
let debug = false;
let hexagonVertices = [];
let triangles = [];

// Draw a hexagon in the middle of the canvas
function drawHexagon(newRValue = 0) {
    chaosCtx.clearRect(0, 0, chaosCanvas.width, chaosCanvas.height);
    chaosCtx.beginPath();
    const hexagonHeight = Math.sqrt(3) * hexagonSide / 2;
    chaosCtx.moveTo(middleX + hexagonSide, middleY);
    chaosCtx.lineTo(middleX + hexagonSide / 2, middleY + hexagonHeight);
    chaosCtx.lineTo(middleX - hexagonSide / 2, middleY + hexagonHeight);
    chaosCtx.lineTo(middleX - hexagonSide, middleY);
    chaosCtx.lineTo(middleX - hexagonSide / 2, middleY - hexagonHeight);
    chaosCtx.lineTo(middleX + hexagonSide / 2, middleY - hexagonHeight);
    chaosCtx.lineTo(middleX + hexagonSide, middleY);
    chaosCtx.strokeStyle = "black";
    chaosCtx.stroke();
    chaosCtx.closePath();

    // draw value of r
    chaosCtx.font = "20px Arial";
    chaosCtx.fillStyle = "black";
    chaosCtx.textAlign = "center";
    chaosCtx.fillText(`r = ${newRValue || rValue}`, middleX, middleY + hexagonHeight + 20);
}

function pickRandomPoint() {
    // pick a triangle at random
    let triangle = triangles[Math.floor(Math.random() * 6)];
    // pick a point at random inside the triangle
    let pointX;
    let pointY;
    do {
        let r1 = Math.random();
        let r2 = Math.random();
        pointX = (1 - Math.sqrt(r1)) * triangle.a.x + (Math.sqrt(r1) * (1 - r2)) * triangle.b.x + (Math.sqrt(r1) * r2) * triangle.c.x;
        pointY = (1 - Math.sqrt(r1)) * triangle.a.y + (Math.sqrt(r1) * (1 - r2)) * triangle.b.y + (Math.sqrt(r1) * r2) * triangle.c.y;
    } while (pointX < middleX - hexagonSide || pointX > middleX + hexagonSide || pointY < middleY - hexagonHeight || pointY > middleY + hexagonHeight);

    return new Point(pointX, pointY);
}

function pickRandomVertex() {
    let vertex = hexagonVertices[Math.floor(Math.random() * 6)];
    if (debug) {
        // highlight the vertex
        chaosCtx.beginPath();
        chaosCtx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
        chaosCtx.fillStyle = "blue";
        chaosCtx.fill();
        chaosCtx.closePath();
    }

    return vertex;
}

async function placePointBetween(point, vertex, rValue) {
    let newPoint = {
        x: (1 - rValue) * point.x + rValue * vertex.x,
        y: (1 - rValue) * point.y + rValue * vertex.y
    };

    if (debug) {
        // draw a line between the point and the vertex
        chaosCtx.beginPath();
        chaosCtx.moveTo(point.x, point.y);
        chaosCtx.lineTo(vertex.x, vertex.y);
        chaosCtx.strokeStyle = "red";
        chaosCtx.stroke();
        chaosCtx.closePath();
        await new Promise(r => setTimeout(r, 1000));
    }

    // highlight the new point
    chaosCtx.beginPath();
    chaosCtx.arc(newPoint.x, newPoint.y, debug ? 5 : 1, 0, Math.PI * 2);
    chaosCtx.fillStyle = "red";
    chaosCtx.fill();
    chaosCtx.closePath();

    return newPoint;
}

async function iterate(pivot, newRValue = 0) {
    // highlight the point
    if (debug) {
        chaosCtx.beginPath();
        chaosCtx.arc(pivot.x, pivot.y, 5, 5, Math.PI * 2);
        chaosCtx.fillStyle = "red";
        chaosCtx.fill();
        chaosCtx.closePath();
    }
    let vertex = pickRandomVertex();
    if (debug) {
        await new Promise(r => setTimeout(r, 1000));
    }
    let newPoint = await placePointBetween(pivot, vertex, newRValue || rValue);
    return newPoint;
}

function writeIteration(i) {
    // write the current iteration in the canvas
    chaosCtx.clearRect(middleX - hexagonSide - 20, middleY - hexagonHeight - 40, 2 * hexagonSide, 40);
    chaosCtx.font = "20px Arial";
    chaosCtx.fillStyle = "black";
    chaosCtx.textAlign = "center";
    chaosCtx.fillText(i, middleX, middleY - hexagonHeight - 20);
}


shadowRoot.getElementById('r').addEventListener('input', event => {
    rValue = parseFloat(event.target.value);
});

shadowRoot.getElementById('iterations').addEventListener('input', event => {
    iterations = parseInt(event.target.value) * 1000;
});

shadowRoot.getElementById('instant').addEventListener('change', event => {
    instant = event.target.checked;
});

shadowRoot.getElementById('debug').addEventListener('change', event => {
    debug = event.target.checked;
});

async function startchaos(newRValue = 0) {
    // clear the canvas
    drawHexagon(newRValue);

    let point = pickRandomPoint();
    for (let i = 0; i < iterations; i++) {
        writeIteration(i);

        point = await iterate(point, newRValue);
        if (!instant) {
            await new Promise(r => setTimeout(r, debug ? 1000 : 1));
        }
    }
}

async function sweep() {
    for (var r = 0; r <= 2; r += 0.01) {
        startchaos(r);

        await new Promise(r => setTimeout(r, 500));
    }
}

function resetchaos() {
    drawHexagon();

    // get vertices of the hexagon's vertices
    hexagonVertices = [];
    hexagonVertices.push(new Point(middleX + hexagonSide, middleY));
    hexagonVertices.push(new Point(middleX + hexagonSide / 2, middleY + hexagonHeight));
    hexagonVertices.push(new Point(middleX - hexagonSide / 2, middleY + hexagonHeight));
    hexagonVertices.push(new Point(middleX - hexagonSide, middleY));
    hexagonVertices.push(new Point(middleX - hexagonSide / 2, middleY - hexagonHeight));
    hexagonVertices.push(new Point(middleX + hexagonSide / 2, middleY - hexagonHeight));
    // highlight the vertices
    hexagonVertices.forEach(vertex => {
        chaosCtx.beginPath();
        chaosCtx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
        chaosCtx.fillStyle = "black";
        chaosCtx.fill();
        chaosCtx.closePath();
    });

    // split the hexagon into 6 triangles
    triangles = [];
    for (let i = 0; i < 6; i++) {
        triangles.push({
            a: hexagonVertices[i],
            b: hexagonVertices[(i + 1) % 6],
            c: new Point(middleX, middleY)
        });
    }
}

resetchaos();

export { startchaos, sweep, resetchaos };