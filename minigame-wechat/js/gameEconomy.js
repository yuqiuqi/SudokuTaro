"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAILY_ERASE_GRANT = exports.DAILY_UNDO_GRANT = exports.MAX_PROP = exports.INITIAL_ERASE_PROPS = exports.INITIAL_UNDO_PROPS = exports.STORAGE_KEY = void 0;
exports.loadEconomy = loadEconomy;
exports.saveEconomy = saveEconomy;
exports.applyDailyBonus = applyDailyBonus;
exports.tryConsumeUndoProp = tryConsumeUndoProp;
exports.tryConsumeEraseProp = tryConsumeEraseProp;
exports.mergeSettings = mergeSettings;
/**
 * 道具 / 设置存档（与 Taro 端同 KEY；小游戏用 wx 存储）
 */
exports.STORAGE_KEY = 'yifang_sudoku_economy_v1';
exports.INITIAL_UNDO_PROPS = 5;
exports.INITIAL_ERASE_PROPS = 5;
exports.MAX_PROP = 99;
exports.DAILY_UNDO_GRANT = 2;
exports.DAILY_ERASE_GRANT = 2;
const defaultSettings = {
    vibration: true,
};
function todayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}
function defaultState() {
    return {
        undoProps: exports.INITIAL_UNDO_PROPS,
        eraseProps: exports.INITIAL_ERASE_PROPS,
        dailyDateKey: '',
        settings: Object.assign({}, defaultSettings),
    };
}
function clampNum(v, min, max, fallback) {
    const n = typeof v === 'number' && !Number.isNaN(v) ? v : fallback;
    return Math.min(max, Math.max(min, n));
}
function loadEconomy() {
    var _a, _b;
    try {
        const raw = wx.getStorageSync(exports.STORAGE_KEY);
        if (raw == null || raw === '') {
            return defaultState();
        }
        const obj = typeof raw === 'object' && raw !== null ? raw : defaultState();
        const base = defaultState();
        return {
            undoProps: clampNum(obj.undoProps, 0, exports.MAX_PROP, base.undoProps),
            eraseProps: clampNum(obj.eraseProps, 0, exports.MAX_PROP, base.eraseProps),
            dailyDateKey: typeof obj.dailyDateKey === 'string' ? obj.dailyDateKey : base.dailyDateKey,
            settings: {
                vibration: (_b = (_a = obj.settings) === null || _a === void 0 ? void 0 : _a.vibration) !== null && _b !== void 0 ? _b : base.settings.vibration,
            },
        };
    }
    catch (_c) {
        return defaultState();
    }
}
function saveEconomy(state) {
    try {
        wx.setStorageSync(exports.STORAGE_KEY, state);
    }
    catch (_a) {
        /* ignore */
    }
}
function applyDailyBonus(state) {
    const today = todayKey();
    if (state.dailyDateKey === today) {
        return state;
    }
    return Object.assign(Object.assign({}, state), { dailyDateKey: today, undoProps: Math.min(exports.MAX_PROP, state.undoProps + exports.DAILY_UNDO_GRANT), eraseProps: Math.min(exports.MAX_PROP, state.eraseProps + exports.DAILY_ERASE_GRANT) });
}
function tryConsumeUndoProp(state) {
    if (state.undoProps < 1) {
        return { ok: false, next: state };
    }
    return { ok: true, next: Object.assign(Object.assign({}, state), { undoProps: state.undoProps - 1 }) };
}
function tryConsumeEraseProp(state) {
    if (state.eraseProps < 1) {
        return { ok: false, next: state };
    }
    return { ok: true, next: Object.assign(Object.assign({}, state), { eraseProps: state.eraseProps - 1 }) };
}
function mergeSettings(state, patch) {
    return Object.assign(Object.assign({}, state), { settings: Object.assign(Object.assign({}, state.settings), patch) });
}
