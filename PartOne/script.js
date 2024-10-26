const canvas = document.getElementById('classification-graph');
const ctx = canvas.getContext('2d');
const learnButton = document.getElementById('learn-btn');
const clearButton = document.getElementById('clear-btn');
const accuracyDisplay = document.getElementById('accuracy');

let class1Points = [];
let class2Points = [];
let weights = [0, 0];
let bias = 0;
const gridSpacing = 50;

// Disable the context menu on right-click
canvas.addEventListener('contextmenu', event => event.preventDefault());

// Draw a gridded background on the canvas
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;

    for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText(x, x, 12);
    }

    for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        ctx.fillStyle = 'black';
        ctx.fillText(y, 2, y);
    }
}

// Handle canvas click for adding points
canvas.addEventListener('mousedown', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (event.button === 0) {
        class1Points.push({ x, y });
        drawPoint(x, y, 'green', 'circle');
    } else if (event.button === 2) {
        class2Points.push({ x, y });
        drawPoint(x, y, 'red', 'square');
    }
});

// Function to draw a point on the canvas
function drawPoint(x, y, color, shape) {
    ctx.fillStyle = color;
    if (shape === 'circle') {
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    } else if (shape === 'square') {
        ctx.fillRect(x - 5, y - 5, 10, 10);
    }
}

// Updated function to classify a point with trained weights
function classifyBinaryPoint(x, y) {
    const score = weights[0] * x + weights[1] * y + bias;
    return score >= 0 ? 'Circle' : 'Square';
}

// Handle learning and drawing the decision boundary
learnButton.addEventListener('click', function () {
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);

    let dataPoints = [
        ...class1Points.map(p => ({ ...p, label: 1 })),
        ...class2Points.map(p => ({ ...p, label: 0 }))
    ];

    perceptronTrain(dataPoints, learningRate, maxIterations);
    drawDecisionBoundary();
});

// Perceptron training function with refined logic
function perceptronTrain(dataPoints, learningRate, maxIterations) {
    weights = [Math.random(), Math.random()];
    bias = Math.random();

    for (let iter = 0; iter < maxIterations; iter++) {
        let allCorrect = true;

        dataPoints.forEach(point => {
            const prediction = classifyBinaryPoint(point.x, point.y);
            const error = point.label - (prediction === 'Circle' ? 1 : 0);

            if (error !== 0) {
                weights[0] += learningRate * error * point.x;
                weights[1] += learningRate * error * point.y;
                bias += learningRate * error;
                allCorrect = false;
            }
        });

        if (allCorrect) break;
    }

    const accuracy = calculateAccuracy(dataPoints);
    accuracyDisplay.innerText = `Accuracy: ${accuracy.toFixed(2)}%`;
}

// Accuracy calculation function
function calculateAccuracy(dataPoints) {
    let correctPredictions = 0;
    dataPoints.forEach(point => {
        const prediction = classifyBinaryPoint(point.x, point.y);
        if ((prediction === 'Circle' && point.label === 1) || (prediction === 'Square' && point.label === 0)) {
            correctPredictions++;
        }
    });
    return (correctPredictions / dataPoints.length) * 100;
}

// Draw the decision boundary (a line that separates the two classes)
function drawDecisionBoundary() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    class1Points.forEach(point => drawPoint(point.x, point.y, 'green', 'circle'));
    class2Points.forEach(point => drawPoint(point.x, point.y, 'red', 'square'));

    const x1 = 0;
    const y1 = (-bias - weights[0] * x1) / weights[1];
    const x2 = canvas.width;
    const y2 = (-bias - weights[0] * x2) / weights[1];

    if (isFinite(y1) && isFinite(y2)) {
        ctx.strokeStyle = 'lightblue';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

// Clear canvas and reset data
clearButton.addEventListener('click', function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    class1Points = [];
    class2Points = [];
    accuracyDisplay.innerText = 'Accuracy: ';
    drawGrid();
});

// Event listener for the predict button in binary classification
document.getElementById('binary-predict-btn').addEventListener('click', function () {
    const xCoord = parseFloat(document.getElementById('binary-input-x').value);
    const yCoord = parseFloat(document.getElementById('binary-input-y').value);

    const resultClass = classifyBinaryPoint(xCoord, yCoord);
    document.getElementById('binary-output-result').innerText = `This point belongs to: ${resultClass}`;
});

// Draw the initial grid when the canvas loads
drawGrid();

// Get the multi-class button element
const multiClassButton = document.getElementById('multi-class-btn');

// Add event listener to open the multi-class classification page
multiClassButton.addEventListener('click', function () {
    window.location.href = '../PartTwo/part2.html#Part2'; // Redirect to another page for multi-class
});