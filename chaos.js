const chaosClosure = (_ => {
    const parent = document.querySelector('simulation-elem[name="chaos"]');
    const chaosCanvas = parent.shadowRoot.querySelector('canvas');
    const chaosCtx = chaosCanvas.getContext('2d');
    const middleX = chaosCanvas.width / 2;
    const middleY = chaosCanvas.height / 2;
    const hexagonSide = 400;
    const hexagonHeight = Math.sqrt(3) * hexagonSide / 2;
    let rValue = 0.5;
    let iterations = 10000;
    let instant = false;
    let debug = false;

    // Draw a hexagon in the middle of the canvas
    function drawHexagon() {
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
    }

    drawHexagon();
    // get vectors of the hexagon's vertices
    let hexagonVertices = [];
    hexagonVertices.push({ x: middleX + hexagonSide, y: middleY });
    hexagonVertices.push({ x: middleX + hexagonSide / 2, y: middleY + hexagonHeight });
    hexagonVertices.push({ x: middleX - hexagonSide / 2, y: middleY + hexagonHeight });
    hexagonVertices.push({ x: middleX - hexagonSide, y: middleY });
    hexagonVertices.push({ x: middleX - hexagonSide / 2, y: middleY - hexagonHeight });
    hexagonVertices.push({ x: middleX + hexagonSide / 2, y: middleY - hexagonHeight });
    // highlight the vertices
    hexagonVertices.forEach(vertex => {
        chaosCtx.beginPath();
        chaosCtx.arc(vertex.x, vertex.y, 5, 0, Math.PI * 2);
        chaosCtx.fillStyle = "black";
        chaosCtx.fill();
        chaosCtx.closePath();
    });

    // split the hexagon into 6 triangles
    let triangles = [];
    for (let i = 0; i < 6; i++) {
        triangles.push({
            a: hexagonVertices[i],
            b: hexagonVertices[(i + 1) % 6],
            c: { x: middleX, y: middleY }
        });
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

        return { x: pointX, y: pointY };
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

    async function placePointHalfwayBetween(point, vertex) {
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

    async function iterate(pivot) {
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
        let newPoint = await placePointHalfwayBetween(pivot, vertex);
        return newPoint;
    }

    function writeIteration(i) {
        // write the current iteration in the canvas
        chaosClosure.chaosCtx.clearRect(middleX - hexagonSide - 20, middleY - hexagonHeight - 40, 2 * hexagonSide, 40);
        chaosClosure.chaosCtx.font = "20px Arial";
        chaosClosure.chaosCtx.fillStyle = "black";
        chaosClosure.chaosCtx.textAlign = "center";
        chaosClosure.chaosCtx.fillText(i, middleX, middleY - hexagonHeight - 20);
    }


    document.getElementById('r').addEventListener('input', event => {
        rValue = parseFloat(event.target.value);
    });

    document.getElementById('iterations').addEventListener('input', event => {
        iterations = parseInt(event.target.value);
        document.getElementById('iterationsValue').innerText = iterations;
    });

    document.getElementById('instant').addEventListener('change', event => {
        instant = event.target.checked;
    });

    document.getElementById('debug').addEventListener('change', event => {
        debug = event.target.checked;
    });

    return {
        drawHexagon,
        iterate,
        chaosCtx,
        pickRandomPoint,
        getInstant: _ => instant,
        getNumIterations: _ => iterations,
        writeIteration,
        debug
    };
})();

async function startchaos() {
    // clear the canvas
    chaosClosure.drawHexagon();

    let point = chaosClosure.pickRandomPoint();
    for (let i = 0; i < chaosClosure.getNumIterations(); i++) {
        chaosClosure.writeIteration(i);

        point = await chaosClosure.iterate(point);
        if (!chaosClosure.getInstant()) {
            await new Promise(r => setTimeout(r, chaosClosure.debug ? 1000 : 1));
        }
    }
}