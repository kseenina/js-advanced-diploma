import Bowman from "./characters/Bowman.js";
import Swordsman from "./characters/Swordsman.js";
import Magician from "./characters/Magician.js";
import Vampire from "./characters/Vampire.js";
import Undead from "./characters/Undead.js";
import Daemon from "./characters/Daemon.js";
import { generateTeam } from "./generators.js";
import PositionedCharacter from "./PositionedCharacter.js";
import themes from "./themes.js";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
  }

  init() {
    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
    this.gamePlay.drawUi(themes[this.level]);

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
  }

  onCellClick(index) {
    // TODO: react to click
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
