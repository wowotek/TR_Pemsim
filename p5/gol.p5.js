p5.disableFriendlyErrors = true; // disables FES

const ScreenWidth = 480;
const ScreenHeight = 480;

let ticking = false;
let firstRun = true;

let cellSize = 15;
let board;

let generation;
let initial_colony = 0;
let fitness;
let runningFPS = 5;

function setup() {
    createCanvas(ScreenWidth + 360, ScreenHeight);
    frameRate(runningFPS);
    resetBoard();
}

function draw() {
    background(255);
    board.drawBoard();
    if(ticking){
        
        board.tick();
        fitness = (Math.round(Math.tanh(board.living_cell/initial_colony)*100)/100)*100;
        frameRate(runningFPS);

        if(firstRun){
            initial_colony = board.living_cell;
            console.log(initial_colony); 
        }
        firstRun = false;
    }

    drawInfographs();
    drawControlInfo();
}

function keyPressed(){
    if(key == " "){
        ticking = !ticking; 

        if(ticking){
            push();
            textFont("Fira Code");
            textAlign(LEFT, CENTER);
            textSize(16);
            textStyle(BOLD)
            text('| Turning On...', ScreenWidth+200, 50);
            pop();
            frameRate(runningFPS);
        } else {
            frameRate(10);
        }

        
    } if(key == "n") {
        background(255);
        board.tick();
        board.drawBoard();
        drawInfographs();
        drawControlInfo();
    } if(key == "b"){
        resetBoard(false);
    } if(key == "r") {
        resetBoard(true);
    } if(key == "p"){
        if(runningFPS < 120){
            runningFPS += 1;
        }
    } if(key == "m"){
        if(runningFPS > 0){
            runningFPS -= 1;
        }
    }
}

function resetBoard(randomize){
    board = new Board([ScreenWidth, ScreenHeight], [cellSize, cellSize], 1, randomize);
    generation = 0;
    initial_colony = 0;
    fitness = 0;
    firstRun = true;
}

function drawInfographs() {
    push();
    textFont("Fira Code");
    textAlign(LEFT, CENTER);
    textSize(20);
    textStyle(BOLD)
    fill(0);
    text('Simple Cellular Automata', ScreenWidth + 10, 15);
    text('------------------------', ScreenWidth + 10, 28);

    textSize(16);
    if(ticking){
        text('    Simulation : Running', ScreenWidth+10, 50);
    } else {
        text('    Simulation : Paused', ScreenWidth+10, 50);
    }
    text('    Generation : ', ScreenWidth+10, 70); text(str(generation), ScreenWidth+175, 70);
    text('     Gen / Sec : ', ScreenWidth+10, 90); text(str(runningFPS), ScreenWidth+175, 90);
    text('   Living Cell : ', ScreenWidth+10, 140); text(str(board.living_cell), ScreenWidth+175, 140);
    text('     Dead Cell : ', ScreenWidth+10, 160); text(str(board.dead_cell), ScreenWidth+175, 160);
    text('Colony Fitness : ', ScreenWidth+10, 180); text(str(fitness)+" %", ScreenWidth+175, 180);
    pop();
}

function drawControlInfo(){
    push();
    textFont("Fira Mono");
    textAlign(LEFT, CENTER);
    textSize(13);
    textStyle(BOLD);
    fill(255, 0, 0);
    text('N : Next Frame   | SPACE : Toggle Simulation', ScreenWidth+10, ScreenHeight-60);
    text('B : Blank Board  |     + : Increase Speed', ScreenWidth+10, ScreenHeight-40);
    text('R : Random Board |     - : Decrease Speed', ScreenWidth+10, ScreenHeight-20);
    pop();
}

class Cell {
    constructor(posX, posY) {
        this.x = posX;
        this.y = posY;
        this.live = false;
        this.liveAgain = false;
        this.lastTotal = 0;
    }

    drawCell() {
        push();
        noFill();
        strokeWeight(1);
        if (this.live) {
            fill(0);
        }
        rect(this.x, this.y, cellSize, cellSize);
        pop();

        this.live = this.liveAgain;
    }

    // l = left, r = right, u = up, d = down
    checkNeighbour(l, r, u, d, lu, ru, ld, rd) {
        let total = l + r + u + d + lu + ru + ld + rd;
        this.lastTotal = total;

        if (this.live){
            if(total == 3 && total == 2){
                this.liveAgain = true;
            }

            if(total < 2 || total > 3){
                this.liveAgain = false;  
            }
        } else if (!this.live && total === 3) {
            this.liveAgain = true;
        }
    }
}

class Board {
    constructor(screenSize, cellSize, algorithm, randomize) {
        this.horizontal = floor(screenSize[0] / cellSize[0]);
        this.vertical = floor(screenSize[1] / cellSize[1]);

        let x = 0;
        let y = 0;
        let c = 0;
        let temp = [];
        for (let i = 0; i < this.vertical; i++) {
            let horz = []
            for (let j = 0; j < this.horizontal; j++) {
                let cell = new Cell(x, y);
                if(randomize){
                    if(floor(random(0, 101)) >= 40){
                        cell.live = true;
                        cell.liveAgain = true;
                    }
                }
                horz.push(cell);
                x += cellSize[0];
            }
            x = 0;
            y += cellSize[1];
            temp.push(horz);
        }

        this.board = temp;
        this.algo = algorithm;
        this.living_cell = 0;
        this.dead_cell = 0;
    }

    drawBoard(){
        let living = 0;
        let dead = 0;
        for(let i = 0; i<this.board.length; i++){ // Vertical
            for(let j = 0; j<this.board[i].length; j++){ // Horizontal
                if(mouseIsPressed){
                    let cond1 = mouseX >= this.board[i][j].x && mouseX <= this.board[i][j].x + cellSize;
                    let cond2 = mouseY >= this.board[i][j].y && mouseY <= this.board[i][j].y + cellSize;
                    if(cond1 && cond2){
                        this.board[i][j].live = !this.board[i][j].live;
                        this.board[i][j].liveAgain = this.board[i][j].live;
                    }
                }
                this.board[i][j].drawCell();
                if(this.board[i][j].live){
                    living++;
                } else {
                    dead++;
                }
            }
        }
        this.living_cell = living;
        this.dead_cell = dead;
    }

    tick(){
        for(let i = 0; i<this.board.length; i++){ // Vertical
            for(let j = 0; j<this.board[i].length; j++){ // Horizontal
                let l = 0;
                let r = 0;
                let u = 0;
                let d = 0;
                
                let lu = 0;
                let ru = 0;
                let ld = 0;
                let rd = 0;
                if(this.algo === 0){
                    if(j <= 0){
                        l = 0;
                    } else {
                        l = this.board[i][j-1].live;
                    }

                    if(j >= this.board[i].length - 1){
                        r = 0;
                    } else {
                        r = this.board[i][j + 1].live;
                    }

                    if(i <= 0){
                        u = 0;
                    } else {
                        u = this.board[i - 1][j].live;
                    }

                    if(i >= this.board.length - 1){
                        d = 0;
                    } else {
                        d = this.board[i + 1][j].live;
                    }

                    if(i <= 0 || j <= 0){
                        lu = 0;
                    } else {
                        lu = this.board[i - 1][j - 1].live;
                    }

                    if(i <= 0 || j >= this.board[i].length - 1){
                        ru = 0;
                    } else {
                        ru = this.board[i - 1][j + 1].live;
                    }

                    if(i >= this.board.length - 1 || j <= 0){
                        ld = 0;
                    } else {
                        ld = this.board[i + 1][j - 1].live;
                    } 

                    if(i >= this.board.length - 1 || j >= this.board[i].length - 1){
                        rd = 0;
                    } else {
                        rd = this.board[i + 1][j + 1].live;
                    }
                } else if (this.algo === 1){
                    if(j <= 0){
                        l = this.board[i][this.board[i].length-1].live;
                    } else {
                        l = this.board[i][j-1].live;
                    }

                    if(j >= this.board[i].length - 1){
                        r = this.board[i][0].live;
                    } else {
                        r = this.board[i][j + 1].live;
                    }

                    if(i <= 0){
                        u = this.board[this.board.length - 1][j].live;
                    } else {
                        u = this.board[i - 1][j].live;
                    }

                    if(i >= this.board.length - 1){
                        d = this.board[0][j].live;
                    } else {
                        d = this.board[i + 1][j].live;
                    }

                    if (i <= 0 && j <= 0){
                        lu = this.board[this.board.length - 1][this.board[i].length - 1].live;
                    } else if (j <= 0){
                        lu = this.board[i - 1][this.board[i].length - 1].live;
                    } else if(i <= 0){
                        lu = this.board[this.board.length - 1][j - 1].live;
                    } else {
                        lu = this.board[i - 1][j - 1].live;
                    }

                    if(i <= 0 && j >= this.board[i].length - 1){
                        ru = this.board[this.board.length - 1][0].live;
                    } else if(j >= this.board[i].length - 1){
                        ru = this.board[i - 1][0].live;
                    } else if(i <= 0){
                        ru = this.board[this.board.length - 1][j + 1].live;
                    } else {
                        ru = this.board[i - 1][j + 1].live;
                    }

                    if(i >= this.board.length - 1 && j <= 0){
                        ld = this.board[0][this.board[i].length - 1].live;
                    } else if (j <= 0){
                        ld = this.board[i + 1][this.board[i].length - 1].live;
                    } else if (i >= this.board.length - 1){      
                        ld = this.board[0][j - 1].live;
                    } else {
                        ld = this.board[i + 1][j - 1].live;
                    } 

                    if(i >= this.board.length - 1 && j >= this.board[i].length - 1){
                        rd = this.board[0][0].live;
                    } else if (j >= this.board[i].length - 1){
                        rd = this.board[i + 1][0].live;
                    } else if (i >= this.board.length - 1){
                        rd = this.board[0][j + 1].live;
                    } else {
                        rd = this.board[i + 1][j + 1].live;
                    }
                }
                
                this.board[i][j].checkNeighbour(l, r, u, d, lu, ru, ld, rd);
            }
        }
        generation++;
    }
}