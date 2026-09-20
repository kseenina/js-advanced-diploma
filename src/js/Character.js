/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа, от 1 до 4
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    if (new.target === Character) {
      throw new Error('Нельзя создавать экземпляр класса Character напрямую');
    }

    this.level = 1;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    while (this.level < level) {
      this.levelUp();
    }
  }

  levelUp() {
    this.level++;
    this.health = Math.min(this.health + 80, 100);
    const healthPercent = this.health;
    const multiplier = (80 + healthPercent) / 100;
    this.attack = Math.max(this.attack, Math.floor(this.attack * multiplier));
    this.defence = Math.max(this.defence, Math.floor(this.defence * multiplier));
  }
}
