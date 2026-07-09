const statStatus = document.getElementById("statStatus");
// DOM Elements
const barsContainer = document.getElementById('bars');
const algoSelect = document.getElementById('algoSelect');
const currentOperation = document.getElementById("currentOperation");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");
const sizeSlider = document.getElementById('sizeSlider');
const speedSlider = document.getElementById('speedSlider');
const sizeVal = document.getElementById('sizeVal');
const speedVal = document.getElementById('speedVal');
const runBtn = document.getElementById('runBtn');
const newArrayBtn = document.getElementById('newArrayBtn');
const resetBtn = document.getElementById('resetBtn');
const infoPanel = document.getElementById('info');
const statCompare = document.getElementById('statCompare');
const statSwap = document.getElementById('statSwap');
const statTime = document.getElementById('statTime');
// Constants
const BAR_AREA_HEIGHT = 320;

// Application State
let array = [];
let originalArray = []; 
let barElements = [];
let isRunning = false;
let isPaused = false;
let runId = 0; 

let comparisons = 0;
let writes = 0;
let progress = 0;

// Array Generation
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateNewArray() {
  const size = parseInt(sizeSlider.value);
  array = [];
  for (let i = 0; i < size; i++) {
    array.push(getRandomNumber(5, 100));
  }
  originalArray = [...array];
  drawBars();
  resetStats();
  currentOperation.textContent = "New array generated";
  statStatus.textContent = "Ready";
}

// Visualization
function drawBars() {
  barsContainer.innerHTML = '';
  barElements = [];
  array.forEach((value) => {
    const bar = document.createElement('div');
    bar.classList.add('bar');
    bar.style.height = (value / 100) * BAR_AREA_HEIGHT + 'px';
    barsContainer.appendChild(bar);
    barElements.push(bar);
  });
}

function updateBarHeight(index) {
  barElements[index].style.height = (array[index] / 100) * BAR_AREA_HEIGHT + 'px';
}



let highlighted = [];
function clearHighlight() {
  highlighted.forEach((el) => el.classList.remove('compare', 'swap'));
  highlighted = [];
}

// Animation & Statistics
function handleStep(step) {
  clearHighlight();

  if (step.type === 'compare') {
    comparisons++;
    const [i, j] = step.indices;
    currentOperation.textContent =
        `Comparing index ${i} and ${j}`;
    step.indices.forEach((index) => {
        barElements[index].classList.add('compare');
        highlighted.push(barElements[index]);
    });
  } else if (step.type === 'swap') {
    writes++;
    const [i, j] = step.indices;
    currentOperation.textContent =
        `Swapping index ${i} and ${j}`;
    step.indices.forEach((index) => updateBarHeight(index));
    step.indices.forEach((index) => {
        barElements[index].classList.add('swap');
        highlighted.push(barElements[index]);
    });
  } else if (step.type === 'overwrite') {
    writes++;
    currentOperation.textContent =
        `Writing at index ${step.index}`;
    updateBarHeight(step.index);
    barElements[step.index].classList.add('swap');
    highlighted.push(barElements[step.index]);
  } else if (step.type === 'sorted') {
    currentOperation.textContent =
    `Index ${step.indices[0]} is in its final position`;
    step.indices.forEach((index) =>
        barElements[index].classList.add('sorted')
    );
}
  progress = Math.min(progress + 0.35, 99);

  progressFill.style.width = progress + "%";
  progressPercent.textContent = Math.floor(progress) + "%";
  statCompare.textContent = comparisons;
  statSwap.textContent = writes;
}

function resetStats() {
  comparisons = 0;
  writes = 0;
  progress = 0;
  statCompare.textContent = 0;
  statSwap.textContent = 0;
  statTime.textContent = '0 ms';
  statStatus.textContent = "Ready";
  progressFill.style.width = "0%";
  progressPercent.textContent = "0%";
  currentOperation.textContent = "Waiting to start...";
}

// Utility Functions
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getDelay() {
    const speed = parseInt(speedSlider.value);
    return Math.max(5, 1200 - speed * 12);
}

function setControlsDisabled(disabled) {
  algoSelect.disabled = disabled;
  sizeSlider.disabled = disabled;
}

// Sorting Controls
async function startSort() {
  const thisRun = ++runId;
  isRunning = true;
  isPaused = false;
  resetStats();
  runBtn.textContent = 'Pause';
  statStatus.textContent = "Running";
  setControlsDisabled(true);
  

  const startTime = performance.now();
  const generatorFn = algorithms[algoSelect.value];
  const generator = generatorFn(array);

  for (const step of generator) {
    if (thisRun !== runId) return; 

    handleStep(step);
    await wait(getDelay());

    while (isPaused) {
      await wait(50);
      if (thisRun !== runId) return;
    }
  }

  
  if (thisRun === runId) {
    isRunning = false;
    setControlsDisabled(false);
    runBtn.textContent = 'Start';
    barElements.forEach((bar) => bar.classList.add('sorted'));
    statTime.textContent = Math.round(performance.now() - startTime) + ' ms';
    statStatus.textContent = "Completed ✓";
    progress = 100;
    progressFill.style.width = "100%";
    progressPercent.textContent = "100%";
    currentOperation.textContent = "Sorting completed!";

  }
}

function cancelCurrentRun() {
  runId++;
  isRunning = false;
  isPaused = false;
  setControlsDisabled(false);
  runBtn.textContent = 'Start';
  statStatus.textContent = "Ready";
}

function showAlgoInfo() {
  const info = algoInfo[algoSelect.value];
  infoPanel.innerHTML = `
    <h3>${info.name}</h3>
        <p>${info.description}</p>
        <div>
            <span>Stable</span>
            ${info.stable}
        </div>
        <div>
            <span>In-place</span>
            ${info.inplace}
        </div>
        <div>
            <span>Best Case</span>
            ${info.best}
        </div>
        <div>
            <span>Average Case</span>
            ${info.average}
        </div>
        <div>
            <span>Worst Case</span>
            ${info.worst}
        </div>
        <div>
            <span>Space</span>
            ${info.space}
        </div>
  `;
}

// Event Listeners
algoSelect.addEventListener('change', showAlgoInfo);

sizeSlider.addEventListener('input', () => {
  sizeVal.textContent = sizeSlider.value;
  if (!isRunning) generateNewArray();
});

speedSlider.addEventListener('input', () => {
  speedVal.textContent = speedSlider.value;
});

newArrayBtn.addEventListener('click', () => {
  cancelCurrentRun();
  generateNewArray();
});

resetBtn.addEventListener('click', () => {
  cancelCurrentRun();
  array = [...originalArray];
  drawBars();
  resetStats();
});

runBtn.addEventListener('click', () => {
  if (!isRunning) {
    startSort();
  } else if (!isPaused) {
    isPaused = true;
    runBtn.textContent = 'Resume';
    statStatus.textContent = "Paused";
  } else {
    isPaused = false;
    runBtn.textContent = 'Pause';
    statStatus.textContent = "Running";
  }
});

// Initial Setup
showAlgoInfo();
generateNewArray();