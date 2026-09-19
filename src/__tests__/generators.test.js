import { characterGenerator } from "../js/generators.js";
import Bowman from "../js/characters/Bowman.js";
import Swordsman from "../js/characters/Swordsman.js";
import Magician from "../js/characters/Magician.js";
import { generateTeam } from "../js/generators.js";

const allowedTypes = [Bowman, Swordsman, Magician];
const maxLevel = 5;
const characterCount = 6;
const team = generateTeam(allowedTypes, maxLevel, characterCount);

test('Генератор characterGenerator бесконечно выдает новых персонажей из списка allowTypes', () => {
    const allowedTypesNames = allowedTypes.map(item => item.name.toLowerCase());
    for (let i = 0; i < 100; i++) {
        const character = characterGenerator(allowedTypes).next().value;
        expect(allowedTypesNames).toContain(character.type);
    }
});

test('Генератор generateTeam создает правильное количество персонажей', () => {
    expect(team.characters).toHaveLength(characterCount);
});

test('Генератор generateTeam создает персонажей в правильном диапазоне уровней', () => {
    for(let character of team.characters) {
        expect(character.level).toBeGreaterThanOrEqual(1);
        expect(character.level).toBeLessThanOrEqual(maxLevel);
    }
});