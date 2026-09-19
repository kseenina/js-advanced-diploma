import { calcTileType } from "../js/utils.js";

const boardSize = 8;

test.each([
    [0, 'top-left'],
    [7, 'top-right'],
    [56, 'bottom-left'],
    [63, 'bottom-right'],
    [4, 'top'],
    [60, 'bottom'],
    [16, 'left'],
    [23, 'right'],
    [18, 'center']
])('При индексе %s возвращает %s', (index, expected) => {
    expect(calcTileType(index, boardSize)).toBe(expected);
});