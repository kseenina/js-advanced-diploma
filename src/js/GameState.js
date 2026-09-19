export default class GameState {
  constructor() {
    this.playerTurn = true;
    this.selectedCell = null;
  }

  toggleTurn() {
    this.playerTurn = !this.playerTurn;
  }
  
  static from(object) {
    // TODO: create object
    return null;
  }
}
