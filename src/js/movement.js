function getRowCol(index, boardSize) {
    const row = Math.floor(index / boardSize);
    const col = index % boardSize;
    return {row, col};
}

export function getAvailableMoves(position, boardSize, characterType) {
    const availableMoves = [];
    const maxMove = characterType === 'swordsman' || characterType === 'undead' ? 4 :
    characterType === 'bowman' || characterType === 'vampire' ? 2 : 1;
    const {row, col} = getRowCol(position, boardSize);
    for (let i = 0; i < boardSize * boardSize; i++) {
        if (i !== position) {
            const {row: rowMove, col: colMove} = getRowCol(i, boardSize);
            const dRow = Math.abs(rowMove - row);
            const dCol = Math.abs(colMove - col);
            if (rowMove === row) {
                if (Math.abs(colMove - col) <= maxMove) {
                    availableMoves.push(i);
                }
            }
            if (colMove === col) {
                if(Math.abs(rowMove - row) <= maxMove) {
                    availableMoves.push(i)
                }
            }
            if (dRow === dCol) {
                if(dCol <= maxMove) {
                    availableMoves.push(i);
                }
            }
        }
    }
    return availableMoves;
}

export function getAvailableAttacks(position, boardSize, characterType) {
    const availableAttacks = [];
    const maxAttack = characterType === 'swordsman' || characterType === 'undead' ? 1 :
    characterType === 'bowman' || characterType === 'vampire' ? 2 : 4;
    const {row, col} = getRowCol(position, boardSize);
    for (let i = 0; i < boardSize * boardSize; i++) {
        if (i !== position) {
            const {row: rowAttack, col: colAttack} = getRowCol(i, boardSize);
            const dRow = Math.abs(rowAttack - row);
            const dCol = Math.abs(colAttack - col);
            if (dRow <= maxAttack && dCol <= maxAttack) {
                availableAttacks.push(i);
            }
        }
    }
    return availableAttacks;
}