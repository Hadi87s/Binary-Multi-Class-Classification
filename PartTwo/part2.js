const canvas = document.getElementById('classification-graph');
const ctx = canvas.getContext('2d');
const learnButton = document.getElementById('learn-btn');
const clearButton = document.getElementById('clear-btn');
const accuracyDisplay = document.getElementById('accuracy');
const shapeSelector = document.getElementById('shape-category');

let points = [];
let weights = {};
let biases = {};
const classes = ['circle', 'square', 'triangle', 'rectangle'];
let learningRate = 0.01;
let maxIterations = 1000;

// Disable the context menu on right-click
canvas.addEventListener('contextmenu', event => event.preventDefault());

// Function to draw a gridded background on the canvas
function drawGrid() {
    const gridSpacing = 50;
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    for (let x = 0; x <= canvas.width; x += gridSpacing) ctx.fillText(x, x, 12);
    for (let y = 0; y <= canvas.height; y += gridSpacing) ctx.fillText(y, 2, y);
}

// Handle canvas click for adding points
canvas.addEventListener('mousedown', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    const selectedShape = shapeSelector.value;
    const color = shapeSelector.options[shapeSelector.selectedIndex].getAttribute('data-color');

    points.push({ x, y, shape: selectedShape });
    drawShape(x, y, color, selectedShape);
});

// Function to draw a shape on the canvas
function drawShape(x, y, color, shape) {
    ctx.fillStyle = color;
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape === 'square') {
        ctx.fillRect(x - 5, y - 5, 10, 10);
    } else if (shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(x, y - 5);
        ctx.lineTo(x - 5, y + 5);
        ctx.lineTo(x + 5, y + 5);
        ctx.closePath();
        ctx.fill();
    } else if (shape === 'rectangle') {
        ctx.fillRect(x - 8, y - 5, 20, 10);
    }
}

// Perceptron training for multi-class classification
function perceptronTrain(points, learningRate, maxIterations) {
    classes.forEach(cls => {
        weights[cls] = [Math.random(), Math.random()];
        biases[cls] = Math.random();
    });

    for (let iter = 0; iter < maxIterations; iter++) {
        points.forEach(point => {
            const { x, y, shape } = point;

            classes.forEach(cls => {
                const prediction = classify(x, y, cls);
                const error = (shape === cls ? 1 : 0) - prediction;

                if (error !== 0) {
                    weights[cls][0] += learningRate * error * x;
                    weights[cls][1] += learningRate * error * y;
                    biases[cls] += learningRate * error;
                }
            });
        });
    }

    calculateAccuracy(points);
}

// Function to classify a point based on weights and biases
function classify(x, y, cls) {
    const sum = weights[cls][0] * x + weights[cls][1] * y + biases[cls];
    return sum >= 0 ? 1 : 0;
}

// Calculate accuracy for multi-class classification
function calculateAccuracy(points) {
    let correctPredictions = 0;

    points.forEach(point => {
        const { x, y, shape } = point;
        let maxScore = -Infinity;
        let predictedClass = null;

        classes.forEach(cls => {
            const score = weights[cls][0] * x + weights[cls][1] * y + biases[cls];
            if (score > maxScore) {
                maxScore = score;
                predictedClass = cls;
            }
        });
        if (predictedClass === shape) correctPredictions++;
    });

    const accuracy = (correctPredictions / points.length) * 100;
    accuracyDisplay.innerText = `Accuracy: ${accuracy.toFixed(2)}%`;
}

// Handle learning and drawing decision boundaries
learnButton.addEventListener('click', function () {
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);

    perceptronTrain(points, learningRate, maxIterations);
    drawDecisionBoundaries();
});

// Draw decision boundaries for each class
function drawDecisionBoundaries() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    points.forEach(point => {
        let color;
        switch (point.shape) {
            case 'circle':
                color = 'green';
                break;
            case 'square':
                color = 'red';
                break;
            case 'triangle':
                color = 'blue';
                break;
            case 'rectangle':
                color = 'black';
                break;
        }
        drawShape(point.x, point.y, color, point.shape);
    });

    classes.forEach(cls => {
        const x1 = 0;
        const y1 = (-biases[cls] - weights[cls][0] * x1) / weights[cls][1];
        const x2 = canvas.width;
        const y2 = (-biases[cls] - weights[cls][0] * x2) / weights[cls][1];

        if (isFinite(y1) && isFinite(y2)) {
            ctx.strokeStyle = 'lightblue';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    });
}

// Clear the canvas and reset points and accuracy
clearButton.addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    points = [];
    accuracyDisplay.innerText = 'Accuracy: ';
    drawGrid();
});

// Function to classify a new point based on trained weights and biases
function classifyPoint(x, y) {
    let maxScore = -Infinity;
    let predictedClass = null;

    classes.forEach(cls => {
        const score = weights[cls][0] * x + weights[cls][1] * y + biases[cls];
        if (score > maxScore) {
            maxScore = score;
            predictedClass = cls;
        }
    });

    return predictedClass;
}

// Event listener for classifying a user-input point
document.getElementById('predict-btn').addEventListener('click', function () {
    const x = parseFloat(document.getElementById('input-x').value);
    const y = parseFloat(document.getElementById('input-y').value);

    const resultClass = classifyPoint(x, y);
    document.getElementById('output-result').innerText = `This point belongs to: ${resultClass}`;
});

// Initial grid drawing when the canvas loads
drawGrid();


const multiClassButton = document.getElementById('back-btn');

// Add event listener to open the multi-class classification page
multiClassButton.addEventListener('click', function () {
    window.location.href = '../PartOne/index.html#Solution'; // Redirect to another page for multi-class
});
