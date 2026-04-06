"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoleCount = getHoleCount;
exports.generateSolution = generateSolution;
exports.digHoles = digHoles;
exports.hasConflict = hasConflict;
exports.collectConflictIndices = collectConflictIndices;
exports.boardsEqual = boardsEqual;
function shuffleInPlace(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const t = a[i];
        a[i] = a[j];
        a[j] = t;
    }
    return a;
}
function getHoleCount(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 45 + Math.floor(Math.random() * 6);
        case 'medium':
            return 50 + Math.floor(Math.random() * 6);
        case 'hard':
            return 55 + Math.floor(Math.random() * 11);
        default:
            return 45;
    }
}
function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) {
            return false;
        }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let ii = 0; ii < 3; ii++) {
        for (let jj = 0; jj < 3; jj++) {
            if (grid[startRow + ii][startCol + jj] === num) {
                return false;
            }
        }
    }
    return true;
}
const DIGITS_POOL = [1, 2, 3, 4, 5, 6, 7, 8, 9];
function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                const nums = shuffleInPlace(DIGITS_POOL.slice());
                for (let k = 0; k < nums.length; k++) {
                    const num = nums[k];
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;
                        if (solveSudoku(grid)) {
                            return true;
                        }
                        grid[row][col] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}
function generateSolution() {
    const grid = [];
    for (let r = 0; r < 9; r++) {
        grid.push(Array(9).fill(0));
    }
    solveSudoku(grid);
    return grid;
}
function digHoles(board, initialBoard, holes) {
    const positions = [];
    for (let i = 0; i < 81; i++) {
        positions.push([Math.floor(i / 9), i % 9]);
    }
    const order = shuffleInPlace(positions.slice());
    let dug = 0;
    for (let p = 0; p < order.length; p++) {
        if (dug >= holes) {
            break;
        }
        const row = order[p][0];
        const col = order[p][1];
        if (board[row][col] !== 0) {
            board[row][col] = 0;
            initialBoard[row][col] = 0;
            dug++;
        }
    }
}
function hasConflict(board, row, col, num) {
    for (let j = 0; j < 9; j++) {
        if (j !== col && board[row][j] === num) {
            return true;
        }
    }
    for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][col] === num) {
            return true;
        }
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let ii = 0; ii < 3; ii++) {
        for (let jj = 0; jj < 3; jj++) {
            const r = br + ii;
            const c = bc + jj;
            if ((r !== row || c !== col) && board[r][c] === num) {
                return true;
            }
        }
    }
    return false;
}
function collectConflictIndices(board, row, col, num) {
    const out = new Set();
    out.add(row * 9 + col);
    for (let j = 0; j < 9; j++) {
        if (j !== col && board[row][j] === num) {
            out.add(row * 9 + j);
        }
    }
    for (let i = 0; i < 9; i++) {
        if (i !== row && board[i][col] === num) {
            out.add(i * 9 + col);
        }
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let ii = 0; ii < 3; ii++) {
        for (let jj = 0; jj < 3; jj++) {
            const r = br + ii;
            const c = bc + jj;
            if ((r !== row || c !== col) && board[r][c] === num) {
                out.add(r * 9 + c);
            }
        }
    }
    return out;
}
function boardsEqual(a, b) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (a[r][c] !== b[r][c]) {
                return false;
            }
        }
    }
    return true;
}
