import type {Language} from './gameplay'

export type TutorialDiagram = 'row' | 'column' | 'box' | 'input' | 'tools' | 'hints' | 'new-game'
type TutorialPage = {title: string; body: string; diagram: TutorialDiagram}

/** Short, paired lessons keep the guide readable one step at a time. */
export const tutorial: Record<Language, readonly TutorialPage[]> = {
  zh: [
    {title: '每一行，1～9 各一次', body: '数独是一个 9 × 9 棋盘。横着看，每行都要填入 1～9，不能重复。图中高亮的是完整的一行；数字的顺序可以不同。', diagram: 'row'},
    {title: '每一列，也不能重复', body: '竖着看，每列同样需要 1～9 各一次。填一个格子时，要同时检查它所在的行和列；不能只看一个方向。', diagram: 'column'},
    {title: '每个 3 × 3 宫，各一次', body: '粗线把棋盘分成九个宫，每宫有 3 × 3 个格子。每宫也要有 1～9，不能重复。填满 81 格，并同时满足行、列、宫的规则，就通关了。', diagram: 'box'},
    {title: '先选空格，再点数字', body: '黑色数字是题目给定，不能修改。点击一个空格，再点击下方 1～9 填写；自己填的数字是蓝色。也可以选中已填的蓝色数字，再修改它。', diagram: 'input'},
    {title: '笔记、擦除和撤销', body: '拿不准时开启「笔记」，再点数字记录或取消候选；同一格可以记多个。关闭笔记后才填正式答案。「擦除」清空选中格；「撤销」退回上一步。两者都免费。', diagram: 'tools'},
    {title: '看懂辅助，再自己推理', body: '提示免费，分为定位、提问、解释，不会自动填数。同数会一起高亮。灰色数字键表示行、列或宫已有该数；亮色只是可选，不代表正确答案。键盘输入冲突数字会被拒绝，并标出相关格。', diagram: 'hints'},
    {title: '新局、保存和语言', body: '棋盘上方的「新开一局」可选难度；选择后会生成新题，替换当前进度。只关闭弹窗会继续原局。进度自动保存在当前浏览器；弹窗顶部可选择中文或 English。', diagram: 'new-game'},
  ],
  en: [
    {title: 'Each row needs 1–9 once', body: 'Sudoku has a 9 × 9 board. Each horizontal row needs every digit from 1 to 9, without repeats. The highlighted row is complete; digits can appear in any order.', diagram: 'row'},
    {title: 'Each column needs 1–9 once', body: 'Each vertical column also needs every digit from 1 to 9, without repeats. Before entering a digit, check both its row and its column.', diagram: 'column'},
    {title: 'Each 3 × 3 box needs 1–9', body: 'Thick lines divide the board into nine boxes of 3 × 3 cells. Each box needs 1–9 without repeats. Complete all 81 cells while following the row, column and box rules to win.', diagram: 'box'},
    {title: 'Select a cell, then a digit', body: 'Black digits are original clues and cannot be changed. Select an empty cell, then tap 1–9 below the board. Your entries are blue. Select a blue entry to change it.', diagram: 'input'},
    {title: 'Notes, Erase and Undo', body: 'Turn Notes on to add or remove candidates; one cell can hold several. Turn Notes off to enter an answer. Erase clears the selected cell. Undo reverses your last move. Both are free.', diagram: 'tools'},
    {title: 'Use help to reason it out', body: 'Free hints locate, ask, then explain; enter answers yourself. Matching digits highlight together. Grey keys already occur in the row, column or box. Bright keys are possible, not confirmed answers. Conflicting keyboard entries are rejected and related cells marked.', diagram: 'hints'},
    {title: 'New games, saves and language', body: 'Use New game above the board to choose a difficulty. Choosing creates a puzzle and replaces this progress; closing keeps your game. Progress saves automatically in this browser. Select 中文 or English at the top of any dialog.', diagram: 'new-game'},
  ],
}
