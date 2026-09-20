export default class GameState {
  constructor() {
    this.level = 1;
    this.positions = [];
    this.playerTurn = true;
    this.selectedCell = null;
    this.availableMoves = [];
    this.availableAttacks = [];
    this.isProcessing = false;
    this.score = 0;
    this.maxScore = 0;
  }

  toggleTurn() {
    this.playerTurn = !this.playerTurn;
  }
  
  static from(object) {
    const state = new GameState();
    state.level = object.level ?? 1;
    state.positions = object.positions ?? [];
    state.playerTurn = object.playerTurn ?? true;
    state.selectedCell = object.selectedCell ?? null;
    state.availableMoves = object.availableMoves ?? [];
    state.availableAttacks = object.availableAttacks ?? [];
    state.isProcessing = object.isProcessing ?? false;
    state.score = object.score ?? 0;
    state.maxScore = object.maxScore ?? 0;

    return state;
  }
}

