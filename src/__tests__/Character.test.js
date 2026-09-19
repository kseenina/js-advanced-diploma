import Bowman from "../js/characters/Bowman.js";
import Character from "../js/Character.js";

test('Исключение выбрасывается при создании объекта класса Character', () => {
    expect(() => new Character(1)).toThrow('Нельзя создавать экземпляр класса Character напрямую');
});

test('Исключение не выбрасывается при создании объектов унаследованных классов', () => {
    expect(() => new Bowman(1)).not.toThrow();
});