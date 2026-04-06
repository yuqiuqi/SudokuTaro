"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 微信小游戏入口：Canvas 绘制 + 触摸。
 * 填数：底部 3×3 数字键 + 可选 wx.onKeyDown（PC）。
 * 布局：主列宽 maxW、左右 padX 一致；整块 UI（含光斑区与键盘）在安全区内垂直居中。
 * 视觉与 src/pages/index/index.scss 对齐（暖色渐变、hero 光斑、胶囊、棋盘与弹窗）。
 */
const engine = __importStar(require("./sudokuEngine"));
let canvas;
let ctx;
/** 布局仅随窗口尺寸变化，缓存避免每帧分配 */
const layoutCache = { key: '', L: null };
const bgGradientCache = { w: 0, h: 0, g: null };
const vignetteCache = { w: 0, h: 0, g: null };
/** 避免每帧 canvas.width= 触发的 GPU 缓冲清空与状态重置 */
let lastCanvasKey = '';
/** Hero 光斑径向渐变仅随 W、heroTop 重建 */
const heroBlobCache = { key: '', items: null };
/** 格子数字展示，避免每格 String(v) 装箱 */
const CELL_DIGITS = [
    '',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
];
/**
 * 数字键仅在按下时使用：1～9 各不相同的青春高饱和色（抬起时全键统一为 NUM_KEY_IDLE）
 */
const NUM_KEY_PALETTE = [
    { p0: '#F43F5E', p1: '#E11D48', sp: '#BE123C' },
    { p0: '#F97316', p1: '#EA580C', sp: '#C2410C' },
    { p0: '#FAB005', p1: '#F59F00', sp: '#D97706' },
    { p0: '#38A169', p1: '#2F855A', sp: '#276749' },
    { p0: '#14B8A6', p1: '#0D9488', sp: '#0F766E' },
    { p0: '#0EA5E9', p1: '#0284C7', sp: '#0369A1' },
    { p0: '#7C3AED', p1: '#6D28D9', sp: '#5B21B6' },
    { p0: '#D946EF', p1: '#C026D3', sp: '#A21CAF' },
    { p0: '#06B6D4', p1: '#0891B2', sp: '#0E7490' },
];
/** 未按下时所有数字键统一玻璃态（与撤销/擦除一致） */
const NUM_KEY_IDLE = {
    n0: '#ffffff',
    n1: '#f5f5f4',
    strokeN: 'rgba(28, 25, 23, 0.1)',
    text: '#292524',
};
function hexToRgb(hex) {
    const h = hex.replace('#', '').trim();
    return {
        r: parseInt(h.slice(0, 2), 16),
        g: parseInt(h.slice(2, 4), 16),
        b: parseInt(h.slice(4, 6), 16),
    };
}
function mixRgb(a, b, t) {
    return {
        r: Math.round(a.r + (b.r - a.r) * t),
        g: Math.round(a.g + (b.g - a.g) * t),
        b: Math.round(a.b + (b.b - a.b) * t),
    };
}
function rgbCss(rgb) {
    return 'rgb(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ')';
}
/** 数字键调色板预解析，松手动画插值避免每帧 hex 解析 */
const IDLE_RGB = {
    n0: hexToRgb(NUM_KEY_IDLE.n0),
    n1: hexToRgb(NUM_KEY_IDLE.n1),
};
const NUM_KEY_PALETTE_RGB = NUM_KEY_PALETTE.map((p) => ({
    p0: hexToRgb(p.p0),
    p1: hexToRgb(p.p1),
    sp: hexToRgb(p.sp),
}));
const NUMPAD_RGB_WHITE = { r: 255, g: 255, b: 255 };
const NUMPAD_RGB_TXT_IDLE = hexToRgb(NUM_KEY_IDLE.text);
const NUMPAD_RGB_STROKE_MIX = hexToRgb('#d6d3d1');
/** 缓慢收尾：先快后慢 */
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
function scheduleNextFrame(fn) {
    if (typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(fn);
    }
    else {
        setTimeout(fn, 16);
    }
}
/** 设计稿 750 宽，与 Taro rpx 一致 */
function rp(W, n) {
    return (n / 750) * W;
}
function cloneGrid(g) {
    return g.map(function (row) {
        return row.slice();
    });
}
const state = {
    difficulty: 'easy',
    solution: [],
    board: [],
    initialBoard: [],
    selected: null,
    history: [],
    seconds: 0,
    steps: 0,
    conflictCells: new Set(),
    highlightNum: null,
    wonOpen: false,
    conflictTimer: null,
    timerId: null,
    numPressed: null,
    numReleaseAnim: null,
};
/** 冲突倒计时期间若再次输入/切格，需按此回滚（与 setTimeout 回调一致） */
let pendingConflictRevert = null;
function flushPendingConflict() {
    if (!state.conflictTimer) {
        return;
    }
    clearTimeout(state.conflictTimer);
    state.conflictTimer = null;
    const p = pendingConflictRevert;
    pendingConflictRevert = null;
    if (!p) {
        return;
    }
    const b = cloneGrid(state.board);
    b[p.row][p.col] = p.revertTo;
    state.board = b;
    state.history.pop();
    state.conflictCells.clear();
}
function formatSeconds(total) {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
}
function diffLabel(d) {
    return d === 'easy' ? '初级' : d === 'medium' ? '中级' : '高级';
}
function stopTimer() {
    if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
    }
}
function startTimer() {
    stopTimer();
    state.timerId = setInterval(function () {
        state.seconds++;
        draw();
    }, 1000);
}
function digitFromKeyEvent(res) {
    const k = res.key;
    if (typeof k === 'string' && k.length === 1 && k >= '1' && k <= '9') {
        return k.charCodeAt(0) - 48;
    }
    const code = res.code || '';
    if (code.length === 6 && code.indexOf('Digit') === 0) {
        const d = code.charCodeAt(5) - 48;
        if (d >= 1 && d <= 9) {
            return d;
        }
    }
    if (code.length === 7 && code.indexOf('Numpad') === 0) {
        const n = code.charCodeAt(6) - 48;
        if (n >= 1 && n <= 9) {
            return n;
        }
    }
    return 0;
}
function onKeyboardDown(res) {
    if (state.wonOpen) {
        return;
    }
    const d = digitFromKeyEvent(res);
    if (d >= 1 && d <= 9) {
        fillNumber(d);
    }
}
function newGame(d) {
    const diff = d || state.difficulty;
    state.difficulty = diff;
    if (state.conflictTimer) {
        clearTimeout(state.conflictTimer);
        state.conflictTimer = null;
    }
    pendingConflictRevert = null;
    const sol = engine.generateSolution();
    const b = cloneGrid(sol);
    const init = cloneGrid(sol);
    engine.digHoles(b, init, engine.getHoleCount(diff));
    state.solution = sol;
    state.board = b;
    state.initialBoard = init;
    state.selected = null;
    state.history = [];
    state.seconds = 0;
    state.steps = 0;
    state.conflictCells.clear();
    state.highlightNum = null;
    state.wonOpen = false;
    state.numPressed = null;
    state.numReleaseAnim = null;
    stopTimer();
    startTimer();
    draw();
}
function fillNumber(num) {
    flushPendingConflict();
    state.conflictCells.clear();
    if (!state.selected) {
        state.highlightNum = num;
        draw();
        return;
    }
    const row = state.selected.row;
    const col = state.selected.col;
    if (state.initialBoard[row][col] !== 0) {
        return;
    }
    const prevCell = state.board[row][col];
    if (prevCell === num) {
        return;
    }
    const next = cloneGrid(state.board);
    next[row][col] = num;
    state.history.push({ row: row, col: col, value: prevCell });
    state.board = next;
    state.highlightNum = num;
    if (engine.hasConflict(next, row, col, num)) {
        const ci = engine.collectConflictIndices(next, row, col, num);
        state.conflictCells.clear();
        ci.forEach(function (idx) {
            state.conflictCells.add(idx);
        });
        pendingConflictRevert = { row: row, col: col, revertTo: prevCell };
        state.conflictTimer = setTimeout(function () {
            pendingConflictRevert = null;
            const b = cloneGrid(state.board);
            b[row][col] = prevCell;
            state.board = b;
            state.conflictCells.clear();
            state.history.pop();
            state.conflictTimer = null;
            draw();
        }, 1500);
        draw();
        return;
    }
    state.steps++;
    if (engine.boardsEqual(next, state.solution)) {
        stopTimer();
        state.wonOpen = true;
    }
    draw();
}
function undo() {
    if (state.conflictTimer) {
        flushPendingConflict();
        draw();
        return;
    }
    state.conflictCells.clear();
    if (state.history.length === 0) {
        return;
    }
    const last = state.history[state.history.length - 1];
    state.history.pop();
    const b = cloneGrid(state.board);
    b[last.row][last.col] = last.value;
    state.board = b;
    draw();
}
function erase() {
    flushPendingConflict();
    state.conflictCells.clear();
    if (!state.selected) {
        return;
    }
    const row = state.selected.row;
    const col = state.selected.col;
    if (state.initialBoard[row][col] !== 0) {
        return;
    }
    if (state.board[row][col] === 0) {
        return;
    }
    state.history.push({ row: row, col: col, value: state.board[row][col] });
    const b = cloneGrid(state.board);
    b[row][col] = 0;
    state.board = b;
    draw();
}
function getLayout() {
    const info = wx.getSystemInfoSync();
    const W = info.windowWidth || info.screenWidth || 375;
    const H = info.windowHeight || info.screenHeight || 667;
    const dpr = info.pixelRatio || 1;
    const layoutKey = W + '_' + H + '_' + dpr;
    if (layoutCache.key === layoutKey && layoutCache.L) {
        return layoutCache.L;
    }
    const topInset = info.safeArea ? info.safeArea.top : 0;
    const bottomInset = info.safeArea ? Math.max(0, H - info.safeArea.bottom) : 0;
    const edgeX = Math.min(rp(W, 32), W * 0.08);
    const maxW = Math.max(0, Math.min(rp(W, 690), W - 2 * edgeX));
    const padX = (W - maxW) / 2;
    const gap = Math.min(rp(W, 16), Math.max(6, maxW * 0.03));
    const compact = H < 600;
    const v = function (n) {
        return compact ? rp(W, n) * 0.88 : rp(W, n);
    };
    const gapBoardNum = Math.max(6, v(10));
    const gapK = Math.min(rp(W, 10), Math.max(4, maxW * 0.025));
    const keyW = Math.max(0, (maxW - 2 * gapK) / 3);
    const marginBottom = Math.max(v(8), 12);
    const pillH = Math.max(36, v(72));
    const btnH = Math.max(36, v(72));
    const titleGap = compact ? v(20) : rp(W, 32);
    const sectionRel = v(22) +
        v(10) +
        v(56) +
        titleGap +
        pillH +
        v(20) +
        btnH +
        v(18) +
        v(26) +
        v(16);
    const usableH = Math.max(0, H - topInset - bottomInset);
    const heroIdeal = rp(W, 96);
    const marginHero = v(12);
    let keyH = Math.max(36, Math.min(keyW, rp(W, 72)));
    let numPadH = 3 * keyH + 2 * gapK;
    let heroH = Math.min(heroIdeal, Math.max(v(56), H * 0.16));
    let monoY = 0;
    let titleY = 0;
    let statsY = 0;
    let pills = [];
    let actions = [];
    let boardSize = maxW;
    let boardTop = 0;
    let board = {
        left: 0,
        top: 0,
        size: 0,
        radius: v(16),
    };
    let heroTop = topInset;
    let contentTop = topInset;
    let fit = 0;
    while (fit < 28) {
        const roomForBoard = usableH -
            heroH -
            marginHero -
            sectionRel -
            gapBoardNum -
            numPadH -
            marginBottom;
        if (roomForBoard >= maxW) {
            boardSize = maxW;
            break;
        }
        if (heroH > v(40)) {
            heroH = Math.max(v(40), heroH * 0.72);
            fit++;
            continue;
        }
        if (keyH > 22) {
            keyH = Math.max(22, keyH - 4);
            numPadH = 3 * keyH + 2 * gapK;
            fit++;
            continue;
        }
        boardSize = Math.max(0, Math.min(maxW, roomForBoard));
        break;
    }
    const totalH = heroH +
        marginHero +
        sectionRel +
        boardSize +
        gapBoardNum +
        numPadH +
        marginBottom;
    heroTop = topInset + (usableH - totalH) / 2;
    if (heroTop < topInset) {
        heroTop = topInset;
    }
    contentTop = heroTop + heroH + marginHero;
    let y = contentTop;
    /* 数独为第一行，SUDOKU 副标在其下（与 Taro 页一致） */
    titleY = y + v(28);
    y += v(56);
    monoY = y + v(11);
    y += v(22) + v(10);
    y += titleGap;
    const pillW = Math.max(0, (maxW - 2 * gap) / 3);
    pills = [];
    const diffs = ['easy', 'medium', 'hard'];
    for (let i = 0; i < 3; i++) {
        pills.push({
            diff: diffs[i],
            x: padX + i * (pillW + gap),
            y: y,
            w: pillW,
            h: pillH,
        });
    }
    y += pillH + v(20);
    const aw = Math.max(0, (maxW - 2 * gap) / 3);
    actions = [
        { kind: 'undo', x: padX, y: y, w: aw, h: btnH, label: '撤销' },
        {
            kind: 'erase',
            x: padX + aw + gap,
            y: y,
            w: aw,
            h: btnH,
            label: '擦除',
        },
        {
            kind: 'newgame',
            x: padX + 2 * (aw + gap),
            y: y,
            w: aw,
            h: btnH,
            label: '新局',
        },
    ];
    y += btnH + v(18);
    statsY = y + v(13);
    y += v(26) + v(16);
    boardTop = y;
    board = {
        left: boardSize === maxW ? padX : padX + (maxW - boardSize) / 2,
        top: boardTop,
        size: boardSize,
        radius: Math.min(v(16), boardSize > 0 ? Math.max(4, boardSize * 0.035) : 0),
    };
    const numY = boardTop + boardSize + gapBoardNum;
    const nums = [];
    for (let kr = 0; kr < 3; kr++) {
        for (let kc = 0; kc < 3; kc++) {
            nums.push({
                num: kr * 3 + kc + 1,
                x: padX + kc * (keyW + gapK),
                y: numY + kr * (keyH + gapK),
                w: keyW,
                h: keyH,
            });
        }
    }
    const result = {
        W: W,
        H: H,
        dpr: dpr,
        topInset: topInset,
        bottomInset: bottomInset,
        usableH: usableH,
        heroTop: heroTop,
        heroH: heroH,
        padX: padX,
        maxW: maxW,
        monoY: monoY,
        titleY: titleY,
        statsY: statsY,
        pills: pills,
        actions: actions,
        board: board,
        nums: nums,
        compact: compact,
        modal: {
            mw: maxW,
            mh: Math.min(v(320), usableH * 0.85),
        },
    };
    layoutCache.key = layoutKey;
    layoutCache.L = result;
    return result;
}
function hitTest(x, y) {
    const L = getLayout();
    if (state.wonOpen) {
        const W = L.W;
        const mw = L.modal.mw;
        const mh = L.modal.mh;
        const mx = L.padX;
        const my = Math.max(L.topInset, L.topInset + (L.usableH - mh) / 2);
        const btnH = rp(W, 88);
        const btnY = my + mh - rp(W, 40) - btnH;
        const btnW = mw - rp(W, 80);
        const btnX = mx + rp(W, 40);
        if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
            return { kind: 'modal_again' };
        }
        const onDim = x < mx || x > mx + mw || y < my || y > my + mh;
        if (onDim) {
            return { kind: 'modal_close' };
        }
        return { kind: 'modal_ignore' };
    }
    for (let p = 0; p < L.pills.length; p++) {
        const pl = L.pills[p];
        if (x >= pl.x && x <= pl.x + pl.w && y >= pl.y && y <= pl.y + pl.h) {
            return { kind: 'diff', diff: pl.diff };
        }
    }
    for (let a = 0; a < L.actions.length; a++) {
        const act = L.actions[a];
        if (x >= act.x && x <= act.x + act.w && y >= act.y && y <= act.y + act.h) {
            return { kind: act.kind };
        }
    }
    const br = L.board;
    if (x >= br.left &&
        x <= br.left + br.size &&
        y >= br.top &&
        y <= br.top + br.size) {
        const cs = br.size / 9;
        const col = Math.floor((x - br.left) / cs);
        const row = Math.floor((y - br.top) / cs);
        if (col >= 0 && col < 9 && row >= 0 && row < 9) {
            return { kind: 'cell', row: row, col: col };
        }
    }
    for (let ni = 0; ni < L.nums.length; ni++) {
        const nm = L.nums[ni];
        if (x >= nm.x && x <= nm.x + nm.w && y >= nm.y && y <= nm.y + nm.h) {
            return { kind: 'num', num: nm.num };
        }
    }
    return null;
}
function roundRectPath(x, y, w, h, r) {
    const iw = Math.max(0, w);
    const ih = Math.max(0, h);
    if (iw < 1e-4 || ih < 1e-4) {
        ctx.beginPath();
        ctx.rect(x, y, iw, ih);
        return;
    }
    const rr = Math.max(0, Math.min(r, iw / 2, ih / 2));
    if (rr < 1e-4) {
        ctx.beginPath();
        ctx.rect(x, y, iw, ih);
        return;
    }
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + iw, y, x + iw, y + ih, rr);
    ctx.arcTo(x + iw, y + ih, x, y + ih, rr);
    ctx.arcTo(x, y + ih, x, y, rr);
    ctx.arcTo(x, y, x + iw, y, rr);
    ctx.closePath();
}
function drawBackgroundGradient(W, H) {
    if (bgGradientCache.w !== W || bgGradientCache.h !== H || !bgGradientCache.g) {
        const g = ctx.createLinearGradient(0, 0, W, H * 0.65);
        g.addColorStop(0, '#faf7f2');
        g.addColorStop(0.48, '#f0ebe3');
        g.addColorStop(1, '#e5dfd4');
        bgGradientCache.w = W;
        bgGradientCache.h = H;
        bgGradientCache.g = g;
    }
    ctx.fillStyle = bgGradientCache.g;
    ctx.fillRect(0, 0, W, H);
}
function drawVignette(W, H) {
    if (vignetteCache.w !== W || vignetteCache.h !== H || !vignetteCache.g) {
        const cx = W * 0.5;
        const cy = H * 0.48;
        const g = ctx.createRadialGradient(cx, cy, Math.min(W, H) * 0.15, cx, cy, Math.max(W, H) * 0.72);
        g.addColorStop(0, 'rgba(28,25,23,0)');
        g.addColorStop(1, 'rgba(28,25,23,0.065)');
        vignetteCache.w = W;
        vignetteCache.h = H;
        vignetteCache.g = g;
    }
    ctx.fillStyle = vignetteCache.g;
    ctx.fillRect(0, 0, W, H);
}
function drawHeroBlobs(W, topInset, _heroH) {
    function fillEllipse(cx, cy, rx, ry) {
        if (typeof ctx.ellipse === 'function') {
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        else {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(rx, ry);
            ctx.beginPath();
            ctx.arc(0, 0, 1, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    const hbKey = W + '_' + topInset;
    let items = heroBlobCache.items;
    if (heroBlobCache.key !== hbKey || !items) {
        const s = W / 750;
        const y0 = topInset;
        const built = [];
        function pushBlob(cx, cy, rx, ry, c0, c1) {
            const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
            g.addColorStop(0, c0);
            g.addColorStop(1, c1);
            built.push({ g: g, cx: cx, cy: cy, rx: rx, ry: ry });
        }
        pushBlob((-40 + 140) * s, y0 + (20 + 100) * s, 140 * s, 100 * s, 'rgba(94,234,212,0.95)', 'rgba(45,212,191,0)');
        pushBlob((180 + 120) * s, y0 + (-20 + 90) * s, 120 * s, 90 * s, 'rgba(253,230,138,0.95)', 'rgba(251,191,36,0)');
        pushBlob(W - (80 + 130) * s, y0 + (40 + 110) * s, 130 * s, 110 * s, 'rgba(196,181,253,0.95)', 'rgba(139,92,246,0)');
        pushBlob(W - (-30 + 100) * s, y0 + 80 * s, 100 * s, 80 * s, 'rgba(249,168,212,0.95)', 'rgba(236,72,153,0)');
        heroBlobCache.key = hbKey;
        heroBlobCache.items = built;
        items = built;
    }
    ctx.save();
    ctx.globalAlpha = 0.42;
    for (let bi = 0; bi < items.length; bi++) {
        const it = items[bi];
        ctx.fillStyle = it.g;
        fillEllipse(it.cx, it.cy, it.rx, it.ry);
    }
    ctx.restore();
}
function drawPill(x, y, w, h, on, W) {
    const r = h / 2;
    if (on) {
        const lg = ctx.createLinearGradient(x, y, x + w, y + h);
        lg.addColorStop(0, '#292524');
        lg.addColorStop(1, '#1c1917');
        ctx.shadowColor = 'rgba(28, 25, 23, 0.28)';
        ctx.shadowBlur = rp(W, 8);
        ctx.shadowOffsetY = rp(W, 4);
        roundRectPath(x, y, w, h, r);
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#1c1917';
        ctx.lineWidth = 1;
        roundRectPath(x, y, w, h, r);
        ctx.stroke();
    }
    else {
        ctx.shadowColor = 'rgba(28, 25, 23, 0.06)';
        ctx.shadowBlur = rp(W, 10);
        ctx.shadowOffsetY = rp(W, 4);
        roundRectPath(x, y, w, h, r);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(28, 25, 23, 0.08)';
        ctx.lineWidth = Math.max(1, rp(W, 2));
        roundRectPath(x, y, w, h, r);
        ctx.stroke();
    }
}
function drawGlassButton(x, y, w, h, label, W, fontRpx) {
    const fr = fontRpx != null ? fontRpx : 28;
    const rr = rp(W, 16);
    ctx.shadowColor = 'rgba(28, 25, 23, 0.06)';
    ctx.shadowBlur = rp(W, 8);
    ctx.shadowOffsetY = rp(W, 2);
    roundRectPath(x, y, w, h, rr);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = 'rgba(28, 25, 23, 0.1)';
    ctx.lineWidth = Math.max(1, rp(W, 2));
    roundRectPath(x, y, w, h, rr);
    ctx.stroke();
    ctx.fillStyle = '#292524';
    ctx.font = '600 ' + rp(W, fr) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
}
/**
 * 数字键盘：抬起全键统一玻璃色；按下为对应鲜艳色；
 * 松手后 numReleaseAnim 从按下色缓动回统一色（t 0→1）
 */
function drawNumPadButton(x, y, w, h, label, W, num) {
    const rr = rp(W, 16);
    const idx = num >= 1 && num <= 9 ? num - 1 : 0;
    const pal = NUM_KEY_PALETTE[idx];
    const idle = NUM_KEY_IDLE;
    const pressed = state.numPressed === num;
    let releaseBlend = null;
    if (state.numReleaseAnim && state.numReleaseAnim.num === num) {
        const raw = (Date.now() - state.numReleaseAnim.start) / state.numReleaseAnim.duration;
        const u = raw >= 1 ? 1 : raw < 0 ? 0 : raw;
        releaseBlend = easeOutCubic(u);
    }
    const lg = ctx.createLinearGradient(x, y, x + w, y + h);
    let strokeC;
    let textC;
    let shadowBlur;
    let shadowY;
    if (pressed) {
        lg.addColorStop(0, pal.p0);
        lg.addColorStop(1, pal.p1);
        strokeC = pal.sp;
        textC = '#ffffff';
        shadowBlur = rp(W, 10);
        shadowY = rp(W, 3);
    }
    else if (releaseBlend != null) {
        const t = releaseBlend;
        const prgb = NUM_KEY_PALETTE_RGB[idx];
        lg.addColorStop(0, rgbCss(mixRgb(prgb.p0, IDLE_RGB.n0, t)));
        lg.addColorStop(1, rgbCss(mixRgb(prgb.p1, IDLE_RGB.n1, t)));
        strokeC = rgbCss(mixRgb(prgb.sp, NUMPAD_RGB_STROKE_MIX, t));
        textC = rgbCss(mixRgb(NUMPAD_RGB_WHITE, NUMPAD_RGB_TXT_IDLE, t));
        shadowBlur = rp(W, 10) + (rp(W, 8) - rp(W, 10)) * t;
        shadowY = rp(W, 3) + (rp(W, 2) - rp(W, 3)) * t;
    }
    else {
        lg.addColorStop(0, idle.n0);
        lg.addColorStop(1, idle.n1);
        strokeC = idle.strokeN;
        textC = idle.text;
        shadowBlur = rp(W, 8);
        shadowY = rp(W, 2);
    }
    ctx.shadowColor = 'rgba(28, 25, 23, 0.08)';
    ctx.shadowBlur = shadowBlur;
    ctx.shadowOffsetY = shadowY;
    roundRectPath(x, y, w, h, rr);
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = strokeC;
    ctx.lineWidth = Math.max(1, rp(W, 2));
    roundRectPath(x, y, w, h, rr);
    ctx.stroke();
    ctx.fillStyle = textC;
    ctx.fillText(label, x + w / 2, y + h / 2);
}
function drawSolidButton(x, y, w, h, label, W) {
    const rr = rp(W, 16);
    const lg = ctx.createLinearGradient(x, y, x + w, y + h);
    lg.addColorStop(0, '#292524');
    lg.addColorStop(1, '#1c1917');
    ctx.shadowColor = 'rgba(28, 25, 23, 0.22)';
    ctx.shadowBlur = rp(W, 12);
    ctx.shadowOffsetY = rp(W, 6);
    roundRectPath(x, y, w, h, rr);
    ctx.fillStyle = lg;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = Math.max(1, rp(W, 2));
    roundRectPath(x, y, w, h, rr);
    ctx.stroke();
    ctx.fillStyle = '#fafaf9';
    ctx.font = '600 ' + rp(W, 28) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2);
}
function draw() {
    const L = getLayout();
    const W = L.W;
    const H = L.H;
    const dpr = L.dpr;
    if (state.numReleaseAnim) {
        const pr = (Date.now() - state.numReleaseAnim.start) / state.numReleaseAnim.duration;
        if (pr >= 1) {
            state.numReleaseAnim = null;
        }
    }
    const canvasKey = W + '_' + H + '_' + dpr;
    if (canvasKey !== lastCanvasKey) {
        canvas.width = W * dpr;
        canvas.height = H * dpr;
        lastCanvasKey = canvasKey;
        heroBlobCache.key = '';
        heroBlobCache.items = null;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawBackgroundGradient(W, H);
    drawVignette(W, H);
    drawHeroBlobs(W, L.heroTop, L.heroH);
    ctx.fillStyle = '#1c1917';
    ctx.font =
        '700 ' + rp(W, L.compact ? 46 : 56) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(28, 25, 23, 0.06)';
    ctx.shadowBlur = rp(W, 12);
    ctx.fillText('数独', W / 2, L.titleY);
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(55, 48, 40, 0.5)';
    ctx.font =
        '500 ' + rp(W, L.compact ? 20 : 22) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SUDOKU', W / 2, L.monoY);
    ctx.fillStyle = 'rgba(55, 48, 40, 0.58)';
    ctx.font =
        '400 ' + rp(W, L.compact ? 24 : 26) + 'px sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'left';
    ctx.fillText('计时 ' + formatSeconds(state.seconds), L.padX, L.statsY);
    ctx.textAlign = 'right';
    ctx.fillText('步数 ' + state.steps, W - L.padX, L.statsY);
    for (let pi = 0; pi < L.pills.length; pi++) {
        const pill = L.pills[pi];
        const on = state.difficulty === pill.diff;
        drawPill(pill.x, pill.y, pill.w, pill.h, on, W);
        ctx.fillStyle = on ? '#ffffff' : 'rgba(55, 48, 40, 0.78)';
        ctx.font =
            (on ? '600 ' : '500 ') +
                rp(W, L.compact ? 24 : 26) +
                'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(diffLabel(pill.diff), pill.x + pill.w / 2, pill.y + pill.h / 2);
    }
    for (let ai = 0; ai < L.actions.length; ai++) {
        const ac = L.actions[ai];
        if (ac.kind === 'newgame') {
            drawSolidButton(ac.x, ac.y, ac.w, ac.h, ac.label, W);
        }
        else {
            drawGlassButton(ac.x, ac.y, ac.w, ac.h, ac.label, W);
        }
    }
    const br = L.board;
    const sz = br.size;
    const cs = sz / 9;
    const boardRr = br.radius;
    if (sz < 1) {
        ctx.fillStyle = 'rgba(120, 113, 108, 0.85)';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('可视区域过小，请调高模拟器窗口或旋转屏幕', W / 2, L.statsY + rp(W, 120));
    }
    else {
        const hasSel = state.selected != null;
        const srow = hasSel ? state.selected.row : -1;
        const scol = hasSel ? state.selected.col : -1;
        const boxR = hasSel ? Math.floor(srow / 3) * 3 : -1;
        const boxC = hasSel ? Math.floor(scol / 3) * 3 : -1;
        const hl = state.highlightNum;
        const boardFont700 = '700 ' + rp(W, 34) + 'px sans-serif';
        const boardFont600 = '600 ' + rp(W, 34) + 'px sans-serif';
        ctx.save();
        roundRectPath(br.left, br.top, sz, sz, boardRr);
        ctx.clip();
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cx = br.left + c * cs;
                const cy = br.top + r * cs;
                const idx = r * 9 + c;
                const fixed = state.initialBoard[r][c] !== 0;
                const sel = hasSel && srow === r && scol === c;
                const conflict = state.conflictCells.has(idx);
                const blockAlt = (Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 1;
                const dim = hasSel &&
                    (r === srow ||
                        c === scol ||
                        (r >= boxR && r < boxR + 3 && c >= boxC && c < boxC + 3));
                const vCell = state.board[r][c];
                const same = hl !== null && vCell === hl && vCell !== 0;
                let fill;
                if (conflict) {
                    fill = blockAlt
                        ? 'rgba(251, 113, 133, 0.24)'
                        : 'rgba(251, 113, 133, 0.22)';
                }
                else if (same) {
                    fill = blockAlt
                        ? 'rgba(52, 211, 153, 0.24)'
                        : 'rgba(52, 211, 153, 0.22)';
                }
                else if (dim) {
                    fill = blockAlt
                        ? 'rgba(45, 212, 191, 0.11)'
                        : 'rgba(45, 212, 191, 0.09)';
                }
                else if (blockAlt) {
                    fill = '#f5f2ed';
                }
                else {
                    fill = '#fffefb';
                }
                ctx.fillStyle = fill;
                ctx.fillRect(cx, cy, cs + 1, cs + 1);
                if (vCell !== 0) {
                    if (conflict) {
                        ctx.fillStyle = '#be123c';
                    }
                    else if (fixed) {
                        ctx.fillStyle = '#1c1917';
                    }
                    else {
                        ctx.fillStyle = '#0d9488';
                    }
                    ctx.font = fixed || conflict ? boardFont700 : boardFont600;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(CELL_DIGITS[vCell], cx + cs / 2, cy + cs / 2);
                }
                if (sel) {
                    const inset = Math.min(rp(W, 3), cs * 0.12);
                    const inner = cs - 2 * inset;
                    if (inner > 0.5) {
                        ctx.strokeStyle = '#0f766e';
                        ctx.lineWidth = Math.max(2, rp(W, 2));
                        roundRectPath(cx + inset, cy + inset, inner, inner, Math.min(rp(W, 10), inner / 2));
                        ctx.stroke();
                    }
                }
            }
        }
        const thinLw = Math.max(1, rp(W, 1));
        const thickLw = Math.max(2, rp(W, 2));
        ctx.strokeStyle = 'rgba(41, 37, 36, 0.12)';
        ctx.lineWidth = thinLw;
        for (let gv = 1; gv < 9; gv++) {
            if (gv % 3 === 0) {
                continue;
            }
            ctx.beginPath();
            const xvl = br.left + gv * cs;
            ctx.moveTo(xvl, br.top);
            ctx.lineTo(xvl, br.top + sz);
            ctx.stroke();
        }
        for (let gh = 1; gh < 9; gh++) {
            if (gh % 3 === 0) {
                continue;
            }
            ctx.beginPath();
            const yhl = br.top + gh * cs;
            ctx.moveTo(br.left, yhl);
            ctx.lineTo(br.left + sz, yhl);
            ctx.stroke();
        }
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = thickLw;
        for (let tv = 1; tv < 9; tv++) {
            if (tv % 3 !== 0) {
                continue;
            }
            ctx.beginPath();
            const xvt = br.left + tv * cs;
            ctx.moveTo(xvt, br.top);
            ctx.lineTo(xvt, br.top + sz);
            ctx.stroke();
        }
        for (let th = 1; th < 9; th++) {
            if (th % 3 !== 0) {
                continue;
            }
            ctx.beginPath();
            const yht = br.top + th * cs;
            ctx.moveTo(br.left, yht);
            ctx.lineTo(br.left + sz, yht);
            ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = '#292524';
        ctx.lineWidth = thickLw;
        roundRectPath(br.left, br.top, sz, sz, boardRr);
        ctx.stroke();
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 ' + rp(W, 34) + 'px sans-serif';
    for (let nki = 0; nki < L.nums.length; nki++) {
        const nk = L.nums[nki];
        drawNumPadButton(nk.x, nk.y, nk.w, nk.h, CELL_DIGITS[nk.num], W, nk.num);
    }
    if (state.wonOpen) {
        ctx.fillStyle = 'rgba(28, 25, 23, 0.48)';
        ctx.fillRect(0, 0, W, H);
        const mw = L.modal.mw;
        const mh = L.modal.mh;
        const mx = L.padX;
        const my = Math.max(L.topInset, L.topInset + (L.usableH - mh) / 2);
        const cardR = rp(W, 28);
        const cg = ctx.createLinearGradient(mx, my, mx, my + mh);
        cg.addColorStop(0, '#ffffff');
        cg.addColorStop(1, '#fafaf9');
        ctx.shadowColor = 'rgba(28, 25, 23, 0.22)';
        ctx.shadowBlur = rp(W, 32);
        ctx.shadowOffsetY = rp(W, 16);
        roundRectPath(mx, my, mw, mh, cardR);
        ctx.fillStyle = cg;
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = 'rgba(28, 25, 23, 0.06)';
        ctx.lineWidth = 1;
        roundRectPath(mx, my, mw, mh, cardR);
        ctx.stroke();
        ctx.fillStyle = '#1c1917';
        ctx.font = '700 ' + rp(W, 40) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('恭喜', W / 2, my + rp(W, 48));
        ctx.fillStyle = 'rgba(68, 64, 60, 0.88)';
        ctx.font = '400 ' + rp(W, 28) + 'px sans-serif';
        ctx.fillText('你在 ' +
            formatSeconds(state.seconds) +
            '（' +
            state.seconds +
            ' 秒）完成数独，', W / 2, my + rp(W, 48) + rp(W, 48));
        ctx.fillText('步数 ' + state.steps + '。', W / 2, my + rp(W, 48) + rp(W, 48) + rp(W, 44));
        const btnH = rp(W, 88);
        const btnY = my + mh - rp(W, 40) - btnH;
        const btnW = mw - rp(W, 80);
        const btnX = mx + rp(W, 40);
        drawSolidButton(btnX, btnY, btnW, btnH, '再来一局', W);
    }
    if (state.numReleaseAnim) {
        scheduleNextFrame(function () {
            draw();
        });
    }
}
function onTouchStart(x, y) {
    const h = hitTest(x, y);
    if (!h) {
        flushPendingConflict();
        state.selected = null;
        state.highlightNum = null;
        state.numPressed = null;
        state.numReleaseAnim = null;
        draw();
        return;
    }
    if (state.wonOpen) {
        state.numPressed = null;
        state.numReleaseAnim = null;
        if (h.kind === 'modal_again') {
            state.wonOpen = false;
            newGame(state.difficulty);
        }
        else if (h.kind === 'modal_close') {
            state.wonOpen = false;
            draw();
        }
        return;
    }
    if (h.kind === 'num') {
        state.numReleaseAnim = null;
        state.numPressed = h.num;
        draw();
        return;
    }
    state.numPressed = null;
    state.numReleaseAnim = null;
    if (h.kind === 'diff') {
        newGame(h.diff);
        return;
    }
    if (h.kind === 'undo') {
        undo();
        return;
    }
    if (h.kind === 'erase') {
        erase();
        return;
    }
    if (h.kind === 'newgame') {
        newGame();
        return;
    }
    if (h.kind === 'cell') {
        flushPendingConflict();
        const sel = { row: h.row, col: h.col };
        state.selected = sel;
        state.conflictCells.clear();
        if (state.board[h.row][h.col] !== 0) {
            state.highlightNum = state.board[h.row][h.col];
        }
        else {
            state.highlightNum = null;
        }
        draw();
        return;
    }
}
function onTouchEnd(x, y) {
    if (state.wonOpen) {
        return;
    }
    if (state.numPressed == null) {
        return;
    }
    const pressedNum = state.numPressed;
    state.numPressed = null;
    const anim = {
        num: pressedNum,
        start: Date.now(),
        duration: 520,
    };
    state.numReleaseAnim = anim;
    const h = hitTest(x, y);
    if (h && h.kind === 'num' && h.num === pressedNum) {
        fillNumber(pressedNum);
    }
    draw();
}
function init() {
    canvas = wx.createCanvas();
    const c = canvas.getContext('2d');
    if (!c) {
        throw new Error('Canvas 2d 不可用');
    }
    ctx = c;
    if (typeof wx.onKeyDown === 'function') {
        wx.onKeyDown(onKeyboardDown);
    }
    wx.onTouchStart(function (e) {
        const t = e.touches[0];
        if (!t) {
            return;
        }
        onTouchStart(t.clientX, t.clientY);
    });
    wx.onTouchEnd(function (e) {
        const t = e.changedTouches && e.changedTouches[0];
        if (!t) {
            return;
        }
        onTouchEnd(t.clientX, t.clientY);
    });
    if (typeof wx.onTouchCancel === 'function') {
        wx.onTouchCancel(function () {
            if (state.numPressed != null || state.numReleaseAnim != null) {
                state.numPressed = null;
                state.numReleaseAnim = null;
                draw();
            }
        });
    }
    if (typeof wx.onWindowResize === 'function') {
        wx.onWindowResize(function () {
            layoutCache.key = '';
            layoutCache.L = null;
            bgGradientCache.w = 0;
            vignetteCache.w = 0;
            draw();
        });
    }
    newGame('easy');
}
init();
