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
import { getAvailableMoves } from "./movement.js";
import { getAvailableAttacks } from "./movement.js";

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.level = 1;
    this.gameState = new GameState();
    this.boardSize = 8;
    this.playerTypes = ['bowman', 'swordsman', 'magician'];
    this.enemyTypes = ['vampire', 'undead', 'daemon'];
    this.characterClasses = [Bowman, Swordsman, Magician];
    this.enemyClasses = [Vampire, Undead, Daemon];
  }

  init() {
    this.gamePlay.drawUi(themes[this.level]);
    this.subscribeToEvents();

    const maxLevel = 4;
    const characterCount = 4;
    
    const playerTeam = generateTeam(this.characterClasses, maxLevel, characterCount);
    const enemyTeam = generateTeam(this.enemyClasses, maxLevel, characterCount);

    const positions = [];
    const usedIndexes = new Set();

    this.generateCharacterPositions(positions, usedIndexes, playerTeam.characters, 0, 1);
    this.generateCharacterPositions(positions, usedIndexes, enemyTeam.characters, 6, 2);

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

  generateCharacterPositions(positions, usedIndexes, characters, startCol, colCount) {
    for (let i = 0; i < characters.length; i++) {
      let index;
      do {
        const col = startCol + Math.floor(Math.random() * colCount);
        const row = Math.floor(Math.random() * this.boardSize);
        index = (row * this.boardSize) + col; 
      } while (usedIndexes.has(index));
      usedIndexes.add(index);
      positions.push(new PositionedCharacter(characters[i], index));
    }
  }

  clearSelection() {
    const { selectedCell, availableMoves, availableAttacks } = this.gameState;
    
    if (selectedCell !== null) {
      this.gamePlay.deselectCell(selectedCell);
    }
    
    for (const moveIndex of availableMoves) {
      this.gamePlay.deselectCell(moveIndex);
    }
    
    for (const moveIndex of availableAttacks) {
      this.gamePlay.deselectCell(moveIndex);
    }
  }

  selectCharacter(index, character) {
    this.gamePlay.selectCell(index);
    this.gameState.selectedCell = index;
    this.gameState.availableMoves = getAvailableMoves(index, this.boardSize, character.type);
    this.gameState.availableAttacks = getAvailableAttacks(index, this.boardSize, character.type);
  }

  hightlightHoveredCell(index, position) {
    const isAvailableMove = this.gameState.availableMoves.includes(index);
    const isAvailableAttack = this.gameState.availableAttacks.includes(index);

    if (!position && isAvailableMove) {
      this.gamePlay.selectCell(index, 'green');
      return;
    }

    if (position && this.isEnemyCharacter(position.character) && isAvailableAttack) {
      this.gamePlay.selectCell(index, 'red');
    }
  }

  async performAttack(playerIndex, enemyIndex) {
    const playerPosition = this.positions.find(p => p.position === playerIndex);
    const enemyPosition = this.positions.find(p => p.position === enemyIndex);

    const playerCharacter = playerPosition.character;
    const enemyCharacter = enemyPosition.character;

    const damage = Math.max(playerCharacter.attack - enemyCharacter.defence, playerCharacter.attack * 0.1);

    await 
    this.gamePlay.showDamage(enemyIndex, Math.round(damage));

    enemyCharacter.health -= damage;
    if (enemyCharacter.health < 0) {
      enemyCharacter.health = 0;
    }

    this.gamePlay.redrawPositions(this.positions);
    this.clearSelection();
    this.gameState.selectedCell = null;
    this.gameState.availableMoves = [];
    this.gameState.availableAttacks = [];
    this.gameState.toggleTurn();
  }

  isPlayerCharacter(character) {
    return this.playerTypes.includes(character.type);
  }

  isEnemyCharacter(character) {
    return this.enemyTypes.includes(character.type);
  }

  onCellClick(index) {    
    const position = this.positions.find(item => item.position === index);

    if (this.gameState.selectedCell === null) {
      if (!position) {
        GamePlay.showError('Тут никого нет! :(');
        return;
      }

      const character = position.character;
      if (!this.isPlayerCharacter(character)) {
        GamePlay.showError('Это не твой боец, не трожь!');
        return;
      }

      this.selectCharacter(index, character);
      return;
    }

    if (this.gameState.selectedCell === index) {
      this.clearSelection();
      this.gameState.selectedCell = null;
      this.gameState.availableMoves = [];
      this.gameState.availableAttacks = [];
      return;
    }

    if (!position) {
      const isAvailableMove = this.gameState.availableMoves.includes(index);
      if (!isAvailableMove) {
        GamePlay.showError('Тут не пройти!');
        return;
      }

      const selectedPosition = this.positions.find(p => p.position === this.gameState.selectedCell);
      selectedPosition.position = index;
      
      this.clearSelection();
      this.gameState.selectedCell = null;
      this.gameState.availableMoves = [];
      this.gameState.availableAttacks = [];

      this.gamePlay.redrawPositions(this.positions);
      this.gameState.toggleTurn();

      return;
    }

    const character = position.character;

    if (!this.isPlayerCharacter(character)) {
      const isAvailableAttacks = this.gameState.availableAttacks.includes(index);
      if (!isAvailableAttacks) {
        GamePlay.showError('Противник вне зоны досягаемости!');
        return;
      }
      this.performAttack(this.gameState.selectedCell, index);
      return;
    }

    this.clearSelection();
    this.selectCharacter(index, character);
  }

  onCellEnter(index) {
    const position = this.positions.find(item => item.position === index);
    
    if (position) {
      const character = position.character;
      const info = this.formatCharacterInfo(character);
      this.gamePlay.showCellTooltip(info, index);
    }

    if (this.gameState.selectedCell === null) {
      this.gamePlay.setCursor('auto');
      return;
    } 
    
    this.hightlightHoveredCell(index, position);
    this.updateCursor(index, position);
  }

  updateCursor(index, position) {
    const isAvailableMove = this.gameState.availableMoves.includes(index);
    const isAvailableAttack = this.gameState.availableAttacks.includes(index);
    const hasCharacter = this.positions.some(p => p.position === index);

    if (!hasCharacter) {
      this.gamePlay.setCursor(isAvailableMove ? 'pointer' : 'not-allowed');
    } else {
      const character = position.character;
      if (this.isPlayerCharacter(character)) {
        this.gamePlay.setCursor('pointer');
      } else if (this.isEnemyCharacter(character) && isAvailableAttack) {
        this.gamePlay.setCursor('crosshair');
      } else {
        this.gamePlay.setCursor('not-allowed');
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    if (this.gameState.selectedCell === index) {
      return;
    }
    this.gamePlay.deselectCell(index)
  }
}