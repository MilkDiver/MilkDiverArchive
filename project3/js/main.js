//1
const numCols = 70;
const numRows = 40;
const cellWidth = 10;
const cellSpacing = 1;

//2
const container = document.querySelector("#gridContainer");

//3
const span = document.createElement('span');
span.className = 'cell';

//4

const cells = [];

//5
for (let row=0; row<numRows;row++){
    cells.push([]);
    for(let col=0;col<numCols;col++){
        let cell = span.cloneNode();
        cell.style.left = `${col * (cellWidth+cellSpacing)}px`;
        cell.style.top = `${row * (cellWidth+cellSpacing)}px`;
        container.appendChild(cell);
        cells[row][col] = cell;
    }
}

//6
let color = "green";

//7
container.onclick = fillCell;

//8
function fillCell(e){
    let rect = container.getBoundingClientRect();
    let mouseX = e.clientX - rect.left;
    let mouseY = e.clientY - rect.top;
    let columnWidth = cellWidth+cellSpacing;
    let col = Math.floor(mouseX/columnWidth);
    let row = Math.floor(mouseY/columnWidth);
    lifeWorld.world[row][col] = 1; 
    let selectedCell = cells[row][col];
    selectedCell.style.backgroundColor = color;
    selectedCell.className = 'cellSelected';
}

//9
let mouseIsDown = false;

//10
container.onmousemove = (e) => {
    e.preventDefault();
    if (mouseIsDown) fillCell(e);
};

//11
container.onmousedown = (e) => {
    e.preventDefault();
    mouseIsDown = true;
};

//12
window.onmouseup = (e) => {
    e.preventDefault();
    mouseIsDown = false;
};

//Life Stuff

//1
let lastUpdate = performance.now();

//2
let lastFrame = performance.now();

//3
let maxFrameDelay = 1000/30;

const lifeWorld = new LifeWorld(numCols, numRows);

//4
lifeWorld.init();
lifeWorld.step();
console.log(lifeWorld.world);

//5
loop(performance.now());

//6
function loop(timestamp){
    requestAnimationFrame(loop);
    lastUpdate = timestamp;
    if (timestamp - lastFrame > maxFrameDelay){
        lastFrame = timestamp;
        lifeWorld.step();
        updateGrid();
    }
}

//7
function updateGrid(){
    for(let row=0;row<numRows;row++){
        for(let col=0;col<numCols;col++){
            let element = cells[row][col];
            if (lifeWorld.world[row][col] === 1){
                element.style.backgroundColor="rgb(7, 206, 0)";
            }else{
                element.style.backgroundColor= "#afeae2";
            }
        }
    }
}


//Buttons!

//Reset Button
const randomSetupButton = document.querySelector('#resetButton');
randomSetupButton.onclick = () => {
    lifeWorld.randomSetup(); 
    updateGrid();
}

//Sanitize Button. Was originally meant to be an Invert Button, but it didn't play out as intended. So now it does this. Effectively lobotomizes the cell population.
const wipeDownButton = document.querySelector('#wetWipeButton');
wipeDownButton.onclick = () => {
    wipeSlime(); 
    updateGrid();
};

//Inverts all the cells in the petri dish! Or, well, it was supposed to. It kinda just kills a ton of cells.
function wipeSlime() {
    for (let row = 0; row < lifeWorld.numRows; row++) {
        for (let col = 0; col < lifeWorld.numCols; col++) {
            lifeWorld.world[row][col] = lifeWorld.world[row][col] === 1 ? 0 : 1; // Toggle cell state. This fancy little line took some googling. But look how neat it is!
        }
    }
}