import GameController from "../js/GameController.js";

test('Метод formatCharacterInfo возвращает корректную строку', () => {
    const gameController = new GameController();
    const character = {
        level: 1,
        attack: 10,
        defence: 40,
        health: 50
    };
    expect(gameController.formatCharacterInfo(character)).toBe('🎖1 ⚔10 🛡40 ❤50');
});