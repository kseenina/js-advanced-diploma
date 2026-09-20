import { getAvailableAttacks, getAvailableMoves, getRowCol } from "./movement.js";

export default function computerTurn(gameController) {
  gameController.gameState.isProcessing = true;
  
  const positions = gameController.positions;
  const playerTypes = gameController.playerTypes;
  const computerTypes = gameController.enemyTypes;
  const boardSize = gameController.boardSize;

  const playerPositions = positions.filter(p => playerTypes.includes(p.character.type));
  const computerPositions = positions.filter(p => computerTypes.includes(p.character.type));

  const allTargets = [];

  for (const computerPos of computerPositions) {
    const attacks = getAvailableAttacks(computerPos.position, boardSize, computerPos.character.type);
    for (const playerPos of playerPositions) {
      if (attacks.includes(playerPos.position)) {
        if (!allTargets.some(p => p.position === playerPos.position)) {
          allTargets.push(playerPos);
        }
      }
    }
  }

  if (allTargets.length > 0) {
    const weakestTarget = allTargets.reduce((min, p) => 
      p.character.health < min.character.health ? p : min
    );
    
    const attacker = computerPositions.find(comp => {
      const attacks = getAvailableAttacks(comp.position, boardSize, comp.character.type);
      return attacks.includes(weakestTarget.position);
    });

    if (attacker) {
      gameController.performAttack(attacker.position, weakestTarget.position);
      gameController.gameState.toggleTurn();
      gameController.gameState.isProcessing = false;
      return;
    }
  }

  let minDistance = Infinity;
  let nearestComputer = null;
  let nearestPlayer = null;
  
  computerPositions.forEach(positionC => {
    const { row: rowC, col: colC } = getRowCol(positionC.position, boardSize);
    
    playerPositions.forEach(positionP => {
      const { row: rowP, col: colP } = getRowCol(positionP.position, boardSize);
      const distance = Math.abs(rowC - rowP) + Math.abs(colC - colP);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestComputer = positionC;
        nearestPlayer = positionP;
      }
    });
  });
  
  if (nearestComputer && nearestPlayer) {
    const moves = getAvailableMoves(nearestComputer.position, boardSize, nearestComputer.character.type);
    const { row: targetRow, col: targetCol } = getRowCol(nearestPlayer.position, boardSize);
    let bestMove = null;
    let minDistanceTotarget = Infinity;

    for(const move of moves) {
        const isOccupied = positions.some(p => p.position === move);
        if (isOccupied) continue;

        const { row: moveRow, col: moveCol } = getRowCol(move, boardSize);
        const distance = Math.abs(moveRow - targetRow) + Math.abs(moveCol - targetCol);

        if (distance < minDistanceTotarget) {
            minDistanceTotarget = distance;
            bestMove = move;
        }
    }

    if (bestMove !== null) {
        nearestComputer.position = bestMove;
        gameController.gamePlay.redrawPositions(positions);
    }
  }

  gameController.gameState.toggleTurn();
  gameController.gameState.isProcessing = false;
}