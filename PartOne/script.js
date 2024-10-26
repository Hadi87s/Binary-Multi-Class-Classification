const canvas = document.getElementById('classification-graph');
const ctx = canvas.getContext('2d');
const learnButton = document.getElementById('learn-btn');
const clearButton = document.getElementById('clear-btn');
const accuracyDisplay = document.getElementById('accuracy');

let class1Points = [];
let class2Points = [];
let weights = [0, 0];
let bias = 0;
const gridSpacing = 50; // Change this value to set grid spacing

// Disable the context menu on right-click
canvas.addEventListener('contextmenu', event => event.preventDefault());

// Function to draw a gridded background on the canvas
// Function to draw a gridded background on the canvas
function drawGrid() {
    ctx.strokeStyle = '#e0e0e0'; // Light gray color for the grid
    ctx.lineWidth = 0.5;

    // Draw vertical grid lines
    for (let x = 0; x < canvas.width; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        // Draw x-axis labels
        ctx.fillStyle = 'black'; // Set text color to black
        ctx.fillText(x, x, 12);
    }

    // Draw horizontal grid lines
    for (let y = 0; y < canvas.height; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        // Draw y-axis labels
        ctx.fillStyle = 'black'; // Set text color to black
        ctx.fillText(y, 2, y);
    }
}


// Handle canvas click for adding points
canvas.addEventListener('mousedown', function (event) {
    const x = event.offsetX;
    const y = event.offsetY;

    if (event.button === 0) {
        // Left Click: Class 1 (Circles)
        class1Points.push({ x, y });
        drawPoint(x, y, 'green', 'circle');
    } else if (event.button === 2) {
        // Right Click: Class 2 (Squares)
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

// Handle learning and drawing the decision boundary
learnButton.addEventListener('click', function () {
    const learningRate = parseFloat(document.getElementById('learning-rate').value);
    const maxIterations = parseInt(document.getElementById('max-iterations').value);

    let dataPoints = [
        ...class1Points.map(p => ({ ...p, label: 1 })),
        ...class2Points.map(p => ({ ...p, label: 0 }))
    ];

    // Train the perceptron model
    perceptronTrain(dataPoints, learningRate, maxIterations);

    // Draw the decision boundary
    drawDecisionBoundary();
});

// Simple perceptron training function
function perceptronTrain(dataPoints, learningRate, maxIterations) {
    weights = [Math.random(), Math.random()];
    bias = Math.random();

    for (let iter = 0; iter < maxIterations; iter++) {
        let correctPredictions = 0; // Reset for each iteration

        dataPoints.forEach(point => {
            const prediction = classify(point.x, point.y);
            const error = point.label - prediction;

            if (error !== 0) {
                weights[0] += learningRate * error * point.x;
                weights[1] += learningRate * error * point.y;
                bias += learningRate * error;
            } else {
                correctPredictions++;
            }
        });

        // Stop if all predictions are correct
        if (correctPredictions === dataPoints.length) break;
    }

    // Calculate final accuracy outside of loop
    let correctPredictions = 0;
    dataPoints.forEach(point => {
        const prediction = classify(point.x, point.y);
        if (prediction === point.label) correctPredictions++;
    });

    const accuracy = (correctPredictions / dataPoints.length) * 100;
    accuracyDisplay.innerText = `Accuracy: ${accuracy.toFixed(2)}%`;
}

// Function to classify a point
function classify(x, y) {
    const sum = weights[0] * x + weights[1] * y + bias;
    return sum >= 0 ? 1 : 0;
}

// Draw the decision boundary (a line that separates the two classes)
function drawDecisionBoundary() {
    const width = canvas.width;
    const height = canvas.height;

    // Clear the previous drawing
    ctx.clearRect(0, 0, width, height);

    // Redraw the grid
    drawGrid();

    // Re-draw all points
    class1Points.forEach(point => drawPoint(point.x, point.y, 'green', 'circle'));
    class2Points.forEach(point => drawPoint(point.x, point.y, 'red', 'square'));

    // Draw the decision line
    const x1 = 0;
    const y1 = (-bias - weights[0] * x1) / weights[1];
    const x2 = width;
    const y2 = (-bias - weights[0] * x2) / weights[1];

    if (isFinite(y1) && isFinite(y2)) { // Only draw line if it's valid
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
    drawGrid(); // Redraw grid after clearing
});

// Get the multi-class button element
const multiClassButton = document.getElementById('multi-class-btn');

// Add event listener to open the multi-class classification page
multiClassButton.addEventListener('click', function () {
    window.location.href = '../PartTwo/part2.html'; // Redirect to another page for multi-class
});

// Model variables for binary classification
let binaryWeights = [Math.random(), Math.random()];
let binaryBias = Math.random();

// Function to classify a point for binary classification
function classifyBinaryPoint(xCoord, yCoord) {
    const score = binaryWeights[0] * xCoord + binaryWeights[1] * yCoord + binaryBias;
    // Return classA if score >= 0, otherwise classB
    return score >= 0 ? 'Circle' : 'Square';
}

// Event listener for the predict button in binary classification
document.getElementById('binary-predict-btn').addEventListener('click', function () {
    const xCoord = parseFloat(document.getElementById('binary-input-x').value);
    const yCoord = parseFloat(document.getElementById('binary-input-y').value);

    const resultClass = classifyBinaryPoint(xCoord, yCoord);
    document.getElementById('binary-output-result').innerText = `This point belongs to: ${resultClass}`;
});

// Draw the initial grid when the canvas loads
drawGrid();
