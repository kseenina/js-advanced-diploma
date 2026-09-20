import { getAvailableMoves, getAvailableAttacks } from "../js/movement.js";

test.each([
    ['bowman', 16],
    ['swordsman', 27],
    ['magician', 8]
])('%s ходит на %d клетки', (type, expected) => {
    const moves = getAvailableMoves(27, 8, type);
    expect(moves.length).toBe(expected);
})

test.each([
    ['bowman', 24],
    ['swordsman', 8],
    ['magician', 63]
])('%s атакует на %d клетки', (type, expected) => {
    const attacks = getAvailableAttacks(27, 8, type);
    expect(attacks.length).toBe(expected);
})