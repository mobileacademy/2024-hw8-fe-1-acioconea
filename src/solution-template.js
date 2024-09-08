/*
 *
 * "board" is a matrix that holds data about the
 * game board, in a form of BoardSquare objects
 *
 * openedSquares holds the position of the opened squares
 *
 * flaggedSquares holds the position of the flagged squares
 *
 */
let board = [];
let openedSquares = [];
// let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;
let bombProbability = 3;
let maxProbability = 15;

const easy = { rowCount: 9, colCount: 9, };
const medium = { rowCount: 16, colCount: 16 };
const hard = { rowCount: 24, colCount: 24 };


function minesweeperGameBootstrapper(level) {
    let set_level;
    switch (level) {
        case "medium":
            set_level = medium;
            break;
        case "hard":
            set_level = hard;
            break;
        default:
            set_level = easy;
    }
    generateBoard(set_level);
}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    document.documentElement.style.setProperty('--row-count', boardMetadata.rowCount);
    document.documentElement.style.setProperty('--column-count', boardMetadata.colCount);

    /*
     *
     * "generate" an empty matrix
     *
     */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    /*
     *
     * TODO fill the matrix with "BoardSquare" objects, that are in a pre-initialized state
     *
     */
    for (let i = 0; i < boardMetadata.rowCount; i++) {
        for (let j = 0; j < boardMetadata.colCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }
    /*
     *
     * "place" bombs according to the probabilities declared at the top of the file
     * those could be read from a config file or env variable, but for the
     * simplicity of the solution, I will not do that
     *
     */
    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            // TODO place the bomb, you can use the following formula: Math.random() * maxProbability < bombProbability
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    /*
     *
     * TODO set the state of the board, with all the squares closed
     * and no flagged squares
     *
     */
    openedSquares = [];
    // flaggedSquares = [];


    //BELOW THERE ARE SHOWCASED TWO WAYS OF COUNTING THE VICINITY BOMBS

    /*
     *
     * TODO count the bombs around each square
     *
     */
    const directions = [
        [-1, -1],
        [-1, 0],
        [-1, 1],
        [0, -1],
        [0, 1],
        [1, -1],
        [1, 0],
        [1, 1]
    ];

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) continue;

            let bombsAround = 0;

            directions.forEach(([dx, dy]) => {
                const x = i + dx;
                const y = j + dy;
                if (x >= 0 && y >= 0 && x < board.length && y < board[i].length && board[x][y].hasBomb) {
                    bombsAround++;
                }
            });

            board[i][j].bombsAround = bombsAround;
        }
    }

    /*
     *
     * print the board to the console to see the result
     *
     */
    renderBoard();
    console.log(board);
}

/*
 *
 * simple object to keep the data for each square
 * of the board
 *
 */
class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}


/*
 * call the function that "handles the game"
 * called at the end of the file, because if called at the start,
 * all the global variables will appear as undefined / out of scope
 *
 */
function startNewGame() {
    const selectedDifficulty = document.getElementById("difficulty").value;
    board = [];
    openedSquares = [];
    bombCount = 0;
    squaresLeft = 0;
    bombProbability = document.getElementById("bombProbability").value;
    maxProbability = document.getElementById("maxProbability").value;
    console.log(bombProbability, maxProbability);
    minesweeperGameBootstrapper(selectedDifficulty);
}
minesweeperGameBootstrapper(easy);

// TODO create the other required functions such as 'discovering' a tile, and so on (also make sure to handle the win/loss cases)
function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    gameBoard.style.gridTemplateColumns = `repeat(${board[0].length}, 40px)`;

    board.forEach((row, i) => {
        row.forEach((square, j) => {
            const squareDiv = document.createElement('div');
            squareDiv.classList.add('square');
            squareDiv.addEventListener('click', () => openSquare(i, j));

            gameBoard.appendChild(squareDiv);
        });
    });
}

function openSquare(x, y) {
    if (board[x][y].opened) return;
    console.log(x, y);

    const squareDiv = document.getElementById('gameBoard').children[x * board[0].length + y];
    const square = board[x][y];
    square.opened = true;
    squaresLeft--;

    squareDiv.classList.add('open');
    if (square.hasBomb) {
        squareDiv.classList.add('bomb');
        squareDiv.textContent = '💣';
        setTimeout(() => {
            alert('Game Over!');
            minesweeperGameBootstrapper(board.length, board[0].length);
        }, 500);
    } else if (square.bombsAround > 0) {
        squareDiv.textContent = square.bombsAround;
    } else {
        const directions = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1]
        ];

        directions.forEach(([dx, dy]) => {
            const newX = x + dx;
            const newY = y + dy;
            if (newX >= 0 && newY >= 0 && newX < board.length && newY < board[0].length) {
                openSquare(newX, newY);
            }
        });
    }

    if (squaresLeft === bombCount) {
        alert('You Win!');
        minesweeperGameBootstrapper(board.length, board[0].length);
    }
}
document.getElementById("startBtn").addEventListener("click", startNewGame);