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
import computerTurn from "./computerTurn.js";

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
    this.lastSelectedCharacter = null;
  }

  init() {
    this.level = 1;
    this.gameState = new GameState();
    this.positions = [];

    this.gamePlay.drawUi(themes[this.level]);
    this.subscribeToEvents();

    this.initLevel(true);
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
    this.lastSelectedCharacter = character;
  }

  highlightHoveredCell(index, position) {
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

  async performAttack(attackerIndex, targetIndex) {
    const attackerPosition = this.positions.find(p => p.position === attackerIndex);
    const targetPosition = this.positions.find(p => p.position === targetIndex);

    const attacker = attackerPosition.character;
    const target = targetPosition.character;

    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1)

    await 
    this.gamePlay.showDamage(targetIndex, Math.round(damage));

    target.health -= damage;
    if (target.health < 0) {
      target.health = 0;
    }

    this.gamePlay.redrawPositions(this.positions);
    this.removeDeadCharacters();
    if (this.checkVictory()) {
      return;
    }
    this.clearSelection();
    this.gameState.selectedCell = null;
    this.gameState.availableMoves = [];
    this.gameState.availableAttacks = [];
    this.gameState.toggleTurn();
    
  }

  removeDeadCharacters() {
    this.positions = this.positions.filter(p => p.character.health > 0);
    this.gamePlay.redrawPositions(this.positions);
  }

  checkVictory() {
    const playerAlive = this.positions.some(p => this.isPlayerCharacter(p.character));
    const enemyAlive = this.positions.some(p => this.isEnemyCharacter(p.character));
    if(!enemyAlive) {
      this.levelUp();
      return true;
    }

    if(!playerAlive) {
      alert('Поражение! Попробуем еще разок?');
      this.level = 1;
      this.init();
      return true;
    }

    return false;
  }

  levelUp() {
    const playerPositions = this.positions.filter(p => this.isPlayerCharacter(p.character));
    for (const pos of playerPositions) {
      const character = pos.character;
      character.levelUp();
    }

    this.level++;
    if (this.level > 4) {
      alert('Вы победили! Мир был освобожден от нечисти силами ваших доблестных бойцов! Спасибо за игру!');
      this.level = 1;
      this.init();
      return;
    }

    this.initLevel(false);
  }

  getPlayerCharacterCountForLevel(level) {
    if (level === 1) return 2;
    if (level === 2) return 3;
    return 5;
  }

  initLevel(isFirstStart = false) {
    const requiredPlayerCount = this.getPlayerCharacterCountForLevel(this.level);

    let playerCharacters = [];
    if (!isFirstStart) {
      playerCharacters = this.positions
        .filter(p => this.isPlayerCharacter(p.character) && p.character.health > 0)
        .map(p => p.character);
    }

    if (isFirstStart) {
      const maxLevel = this.level;
      const playerTeam = generateTeam(this.characterClasses, maxLevel, requiredPlayerCount);
      playerCharacters = playerTeam.characters;
    } else {
      if (playerCharacters.length < requiredPlayerCount) {
        const missingCount = requiredPlayerCount - playerCharacters.length;
        const maxLevel = this.level;
        const newTeam = generateTeam(this.characterClasses, maxLevel, missingCount);
        playerCharacters.push(...newTeam.characters);
      }

      if (playerCharacters.length > requiredPlayerCount) {
        playerCharacters = playerCharacters.slice(0, requiredPlayerCount);
      }
    }

    const maxLevel = this.level;
    const enemyCount = requiredPlayerCount;
    const enemyTeam = generateTeam(this.enemyClasses, maxLevel, enemyCount);
    const enemyCharacters = enemyTeam.characters;

    const positions = [];
    const usedIndexes = new Set();

    this.generateCharacterPositions(positions, usedIndexes, playerCharacters, 0, 2);
    this.generateCharacterPositions(positions, usedIndexes, enemyCharacters, 6, 2);

    this.positions = positions;
    this.gamePlay.drawUi(themes[this.level]);
    this.gamePlay.redrawPositions(this.positions);
  }

  restoreLastSelectedCharacter() {
    if(!this.lastSelectedCharacter) {
      return;
    }
    const position = this.positions.find(item => item.character === this.lastSelectedCharacter);
    if (!position || !this.isPlayerCharacter(position.character)) {
      this.lastSelectedCharacter = null;
      return
    }

    this.selectCharacter(position.position, position.character);
  }

  isPlayerCharacter(character) {
    return this.playerTypes.includes(character.type);
  }

  isEnemyCharacter(character) {
    return this.enemyTypes.includes(character.type);
  }

  async onCellClick(index) {    
    if (this.gameState.isProcessing) {
      return;
    }
    
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
      await computerTurn(this)
      this.restoreLastSelectedCharacter();

      return;
    }

    const character = position.character;

    if (!this.isPlayerCharacter(character)) {
      const isAvailableAttacks = this.gameState.availableAttacks.includes(index);
      if (!isAvailableAttacks) {
        GamePlay.showError('Противник вне зоны досягаемости!');
        return;
      }
      await this.performAttack(this.gameState.selectedCell, index);
      await computerTurn(this);
      this.restoreLastSelectedCharacter();
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
    
    this.highlightHoveredCell(index, position);
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