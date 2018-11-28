PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

var app = new PIXI.Application({
    autoStart: false,
    width: 1124,
    height: 750,
    antialias: false,
    roundPixels: true,
    forceCanvas: false,
    resolution: 1,
    backgroundColor: 0x0
});

document.getElementById("display").appendChild(app.view);

var texture = PIXI.Texture.fromImage('pixel_died.png');
var secondTexture = PIXI.Texture.fromImage('pixel_live.png');

class Cell {
    constructor(posX, posY, cellSize){
        this.pixel = new PIXI.Sprite(secondTexture);
        this.pixel.x = posX;
        this.pixel.y = posY;

        this.pixel.width = cellSize;
        this.pixel.height= cellSize;

        this.isDead = false;
        this.willDead = true;

        app.stage.addChild(this.pixel);
    }

    drawCell(){
        if(this.isDead){
            this.pixel.texture = texture;
        } else {
            this.pixel.texture = secondTexture;
        }

        this.isDead = this.willDead;
    }

    checkNeighbour(l, r, u, d, lu, ru, ld, rd) {
        let total = l + r + u + d + lu + ru + ld + rd;

        if (!this.isDead){
            if(total == 3 && total == 2){
                this.willDead = false;
            }

            if(total < 2 || total > 3){
                this.willDead = true;  
            }
        } else if (this.isDead && total === 3) {
            this.willDead = false;
        }
    }
}

class Board {
    constructor(screenSize, cellSize) {
        
        this.horizontal = Math.floor(screenSize[0] / cellSize);
        this.vertical = Math.floor(screenSize[1]/ cellSize);

        let x = 0;
        let y = 0;
        let temp = [];
        for (let i = 0; i < this.vertical; i++) {
            let horz = []
            for (let j = 0; j < this.horizontal; j++) {
                let cell = new Cell(x, y, cellSize);
                if(Math.floor(Math.random() * 101) >= 80){
                    cell.isDead = true;
                    cell.willDead = false;
                }
                horz.push(cell);
                x += cellSize;
            }
            x = 0;
            y += cellSize;
            temp.push(horz);
        }

        this.board = temp;

        this.__numAlive = 0;
        this.__numDead = 0;
    }

    drawBoard(){
        let numDead = 0;
        let numAlive = 0;
        for(let i = 0; i<this.board.length; i++){ // Vertical
            for(let j = 0; j<this.board[i].length; j++){ // Horizontal
                this.board[i][j].drawCell();
                if(this.board[i][j].isDead){
                    numDead++;
                } else {
                    numAlive++;
                }
            }
        }

        this.__numAlive = numAlive;
        this.__numDead = numDead;
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

                // l = this.board[i][j-1].live;
                // r = this.board[i][j + 1].live;
                // u = this.board[i - 1][j].live;
                // lu = this.board[i - 1][j - 1].live;
                // ru = this.board[i - 1][j + 1].live;
                // ld = this.board[i + 1][j - 1].live;
                // rd = this.board[i + 1][j + 1].live;
                
                if(j <= 0){
                    l = !this.board[i][this.board[i].length-1].isDead;
                } else {
                    l = !this.board[i][j-1].isDead;
                }

                if(j >= this.board[i].length - 1){
                    r = !this.board[i][0].isDead;
                } else {
                    r = !this.board[i][j + 1].isDead;
                }

                if(i <= 0){
                    u = !this.board[this.board.length-1][j].isDead;
                } else {
                    u = !this.board[i - 1][j].isDead;
                }

                if(i >= this.board.length - 1){
                    d = !this.board[0][j].isDead;
                } else {
                    d = !this.board[i + 1][j].isDead;
                }

                if(i <= 0 || j <= 0){
                    lu = !this.board[this.board.length-1][this.board[i].length-1].isDead;
                } else {
                    lu = !this.board[i - 1][j - 1].isDead;
                }

                if(i <= 0 || j >= this.board[i].length - 1){
                    ru = !this.board[this.board.length-1][0].isDead;
                } else {
                    ru = !this.board[i - 1][j + 1].isDead;
                }

                if(i >= this.board.length - 1 || j <= 0){
                    ld = !this.board[0][this.board[i].length-1].isDead;
                } else {
                    ld = !this.board[i + 1][j - 1].isDead;
                } 

                if(i >= this.board.length - 1 || j >= this.board[i].length - 1){
                    rd = !this.board[0][0].isDead;
                } else {
                    rd = !this.board[i + 1][j + 1].isDead;
                }
                
                this.board[i][j].checkNeighbour(l, r, u, d, lu, ru, ld, rd);
            }
        }
    }
}

let b = new Board([app.screen.width-366, app.screen.height], 3);
let text = new PIXI.Text('Dead: ',{fontFamily : 'Monospace', fontSize: 20, fill : 0xffffff, align : 'left'});
let dead = 0;
let alive = 0;
let generation = 0;
text.x = app.screen.width - 360;
app.stage.addChild(text);
app.ticker.add(function() {
    dead = b.__numDead;
    alive = b.__numAlive;
    text.setText("    Simple Binary Automata\n" +
                 "    ----------------------\n" +
                 "Sel Mati : " + dead + "\nSel Hidup : " + alive + "\nGenerasi : " + generation);

    b.tick();
    b.drawBoard();
    generation++;
});
app.ticker.speed = 0;
app.ticker.start();