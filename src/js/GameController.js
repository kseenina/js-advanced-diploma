import Bowman from "./characters/Bowman.js";
import Swordsman from "./characters/Swordsman.js";
import Magician from "./characters/Magician.js";
import Vampire from "./characters/Vampire.js";
import Undead from "./characters/Undead.js";
import Daemon from "./characters/Daemon.js";
import { generateTeam } from "./generators.js";
import PositionedCharacter from "./PositionedCharacter.js";
import themes from "./themes.js";
import GameState from "./GameState.js";
import GamePlay from "./GamePlay.js";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
    this.gameState = new GameState();
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.level]);
    this.subscribeToEvents();

    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Vampire, Undead, Daemon];
    const maxLevel = 4;
    const characterCount = 4;
    
    const playerTeam = generateTeam(playerTypes, maxLevel, characterCount);
    const enemyTeam = generateTeam(enemyTypes, maxLevel, characterCount);

    const boardSize = 8;
    const positions = [];
    const usedIndexes = new Set();

    for (let i = 0; i < characterCount; i++) {
      let index;
      do {
        const col = Math.floor(Math.random() * 2);
        const row = Math.floor(Math.random() * boardSize);
        index = (row * boardSize) + col; 
      } while (usedIndexes.has(index));
      usedIndexes.add(index);
      positions.push(new PositionedCharacter(playerTeam.characters[i], index));
    }

    for (let i = 0; i < characterCount; i++) {
      let index;
      do {
        const col = 6 + Math.floor(Math.random() * 2);
        const row = Math.floor(Math.random() * boardSize);
        index = (row * boardSize) + col;
      } while (usedIndexes.has(index));
      usedIndexes.add(index);
      positions.push(new PositionedCharacter(enemyTeam.characters[i], index));
    }

    this.gamePlay.redrawPositions(positions);
    this.positions = positions;
  }

  subscribeToEvents() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  formatCharacterInfo(character) {
    return `🎖${character.level} ⚔${character.attack} 🛡${character.defence} ❤${character.health}`;
  }

  onCellClick(index) {    
    const position = this.positions.find(item => item.position === index);
    if (!position) {
      GamePlay.showError('Тут никого нет! :(');
      return;
    }
    const character = position.character;
    const playerTypes = ['bowman', 'swordsman', 'magician'];

    if(!playerTypes.includes(character.type)) {
      GamePlay.showError('Это не твой боец, не трожь!');
      return;
    }
    if (this.gameState.selectedCell !== null) {
      const prevIndex = this.gameState.selectedCell;
      this.gamePlay.deselectCell(prevIndex);
    }
    this.gamePlay.selectCell(index);
    this.gameState.selectedCell = index;
  }

  onCellEnter(index) {
    const position = this.positions.find(item => item.position === index);
    if (position) {
      const character = position.character;
      const info = this.formatCharacterInfo(character);
      this.gamePlay.showCellTooltip(info, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
