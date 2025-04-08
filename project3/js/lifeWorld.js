class LifeWorld { //This was a bastard of a class. The code class, not IGME 235. I understand it now. Finally.
    constructor(numCols, numRows) {
        this.numCols = numCols;
        this.numRows = numRows;
        this.world = this.buildArray();
        this.worldBuffer = this.buildArray();
    }

    init() {
        this.randomSetup();
    }

    buildArray() {
        let outerArray = [];
        for (let row = 0; row < this.numRows; row++) {
            let innerArray = [];
            for (let col = 0; col < this.numCols; col++) {
                innerArray.push(0);
            }
            outerArray.push(innerArray);
        }
        return outerArray;
    }

    randomSetup() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                this.world[row][col] = Math.random() < 0.1 ? 1 : 0;
            }
        }
    }

    getLivingNeighbors(row, col) {
        if (row <= 0 || col <= 0 || row >= this.numRows - 1 || col >= this.numCols - 1) {
            return 0;
        }

        const directions = [
            [-1, 0], [0, 1], [1, 0], [0, -1], //N, E, S, W
            [-1, -1], [-1, 1], [1, 1], [1, -1]  //Diagonals
        ];
        let livingNeighbors = 0;
        for (const [x, y] of directions) {
            if (this.world[row + x][col + y] === 1) {
                livingNeighbors++;
            }
        }
        return livingNeighbors;
    }

    step() {
        for (let row = 0; row < this.numRows; row++) {
            for (let col = 0; col < this.numCols; col++) {
                const livingNeighbors = this.getLivingNeighbors(row, col);

                if (this.world[row][col] === 1) {
                    //Cell alive: dies if it has less than 2 or more than 4 neighbors
                    this.worldBuffer[row][col] = (livingNeighbors < 2 || livingNeighbors > 4) ? 0 : 1;
                } else {
                    //Cell dead: comes to life if it has 3 neighbors
                    this.worldBuffer[row][col] = (livingNeighbors === 3) ? 1 : 0;
                }
            }
        }
        let temp = this.world;
        this.world = this.worldBuffer;
        this.worldBuffer = temp;
    }
}