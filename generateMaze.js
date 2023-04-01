
// size variables
var canvasSize = 500
var cols, rows, dim;
var numRows = 10;
var cellsize = canvasSize/numRows;

// global grid
var grid = [];

// dfs generator variables
var curCell;
var stack = [];
var visitCount = 1;
var started = false;
var finished = false;

function handleSubmit(event) {
    event.preventDefault();
    numRows = document.getElementById('input').value;

    // input validation guard clauses
    if (numRows === '' || isNaN(numRows)) {
        alert('Please enter a valid integer value for numRows.');
        return;
    } else {
        if (numRows < 2 || numRows > 50) {
            alert('Enter number of rows between 2 and 50');
            return;
        }
    }

    started = true;
    finished = false;
    setup();
}

function setup() {
    
    createCanvas(canvasSize, canvasSize);
    cols = numRows;
    rows = numRows;
    dim = cols * rows;
    cellsize = canvasSize/numRows;

    // reset stack and visit count
    stack = [];
    visitCount = 1;
    
    grid = makeGrid();
    
    // start current cell at top left cell and mark as visited
    curCell = grid[0];
    curCell.visited = true;
}

function draw() {
    frameRate();
    finished ? background(255) : background(0);

    if (started) {
        generateMaze();
    }
}

function makeGrid() {
  arr = [];
  // generate grid of size i x j
  for (var j = 0; j < cols; j++) {
    for (var i = 0; i < rows; i++) {
      arr.push(new Cell(i, j));
    }
  }
  return arr;
}

function generateMaze() {
  // loop through grid array and display cells
  for (var i = 0; i < grid.length; i++) {
    grid[i].show();
  }
  
  // while there are unvisited neighbor cells
  var next = curCell.getNeighbor();
  
  if (next) {
    removeWalls(curCell, next)
    stack.push(curCell);
    next.visited = true;
    visitCount++;
    curCell = next;
  }
  else if (stack.length > 0) {
    curCell = stack.pop();
  }
  
  if (visitCount == dim) {
    curCell = grid[0];
    stack = [];
    finished = true;
  }
}

// removes adjacent walls between two cells
function removeWalls(c1, c2) {
  if (c1.i < c2.i) {
    c1.walls[1] = false;
    c2.walls[3] = false;
  }
  else if (c1.i > c2.i) {
    c1.walls[3] = false
    c2.walls[1] = false;
  }
  
   if (c1.j < c2.j) {
    c1.walls[2] = false;
    c2.walls[0] = false;
  }
  else if (c1.j > c2.j) {
    c1.walls[0] = false;
    c2.walls[2] = false;
  }
}

class Cell {

    setWalls = function (i, j) {
        var walls = [true, true, true, true];
        if (j == 0) walls[0] = false;
        if (i == (cols - 1)) walls[1] = false;
        if (j == (rows - 1)) walls[2] = false;
        if (i == 0) walls[3] = false;
        return walls;
    }

    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.x = this.i * cellsize;
        this.y = this.j * cellsize;
        this.walls = [true, true, true, true];
        this.visited = false;
        this.prevWall = 2;

        this.show = function () {
            stroke(0);
            strokeWeight(5);
            strokeCap(SQUARE);
            noFill();

            var off = 1;
            // TOP
            if (this.walls[0]) {
                line(this.x + off, this.y, this.x + cellsize - off, this.y);
            }
            // RIGHT
            if (this.walls[1]) {
                line(this.x + cellsize, this.y + off, this.x + cellsize, this.y + cellsize - off);
            }
            // BOTTOM
            if (this.walls[2]) {
                line(this.x + cellsize - off, this.y + cellsize, this.x + off, this.y + cellsize);
            }
            // LEFT
            if (this.walls[3]) {
                line(this.x, this.y + cellsize - off, this.x, this.y + off);
            }

            if (this == curCell) {
                finished ? this.highlight(255) : this.highlight(0, 255, 0)
            }
            else if (this.visited) {
                this.highlight(255, 255, 255);
            }
        };

        this.index = function (i, j) {
            if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
                return -1;
            }
            return i + j * cols;
        };

        this.getNeighbor = function () {
            var neighbors = [];
            var wallWeights = [];

            neighbors.push(this.index(this.i, this.j - 1));
            neighbors.push(this.index(this.i + 1, this.j));
            neighbors.push(this.index(this.i, this.j + 1));
            neighbors.push(this.index(this.i - 1, this.j));

            // formula to get opposite wall
            var opposite = ((this.prevWall + 2) % 4);

            for (var x = 0; x < neighbors.length; x++) {
                // convert index to weighted index and push to arr
                var c = grid[neighbors[x]];
                if (c && !c.visited) {
                    wallWeights.push(x * 2);
                    if (x != opposite) {
                        wallWeights.push(x * 2 + 1);
                    }
                }
            }

            if (wallWeights.length == 0) {
                return false;
            }

            var r = wallWeights[floor(random(0, wallWeights.length))];
            // empty wall weights array
            wallWeights.length = 0;
            // convert weighted index back to 0-3 index
            r = floor(r / 2);
            grid[neighbors[r]].prevWall = ((r + 2) % 4);
            return grid[neighbors[r]];
        };

        this.highlight = function (r, g, b) {
            fill(r, g, b);
            noStroke();
            rect(this.x, this.y, cellsize, cellsize);
        };
    }
}