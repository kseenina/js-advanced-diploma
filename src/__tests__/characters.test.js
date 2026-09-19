import Bowman from "../js/characters/Bowman.js";
import Swordsman from "../js/characters/Swordsman.js";
import Magician from "../js/characters/Magician.js";
import Vampire from "../js/characters/Vampire.js";
import Undead from "../js/characters/Undead.js";
import Daemon from "../js/characters/Daemon.js";

test.each([
    [Bowman, { level: 1, attack: 25, defence: 25, health: 50, type: 'bowman' }],
    [Swordsman, { level: 1, attack: 40, defence: 10, health: 50, type: 'swordsman' }],
    [Magician, { level: 1, attack: 10, defence: 40, health: 50, type: 'magician' }],
    [Vampire, { level: 1, attack: 25, defence: 25, health: 50, type: 'vampire' }],
    [Undead, { level: 1, attack: 40, defence: 10, health: 50, type: 'undead' }],
    [Daemon, { level: 1, attack: 10, defence: 10, health: 50, type: 'daemon' }]
])('Персонаж %s 1-го уровня имеет правильные характеристики', (CharacterClass, expectedCharacter) => {
    const character = new CharacterClass(1);
    expect(character).toEqual(expectedCharacter);
});