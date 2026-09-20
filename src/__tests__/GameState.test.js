import GameController from '../js/GameController.js';
import GamePlay from '../js/GamePlay.js';

jest.mock('../js/GamePlay', () => ({
  __esModule: true,
  default: {
    showError: jest.fn(),
  },
}));

test('состояние игры загружается', () => {
  const gamePlay = {
    drawUi: jest.fn(),
    redrawPositions: jest.fn(),
  };

  const stateService = {
    load: jest.fn().mockReturnValue({
      level: 2,
      positions: [],
      score: 30,
      maxScore: 50,
    }),
  };

  const gameController = new GameController(gamePlay, stateService);
  gameController.restorePositions = jest.fn(() => []);

  gameController.onLoadGame();

  expect(stateService.load).toHaveBeenCalled();
});

test('при ошибке загрузки выводится сообщение', () => {
  const gamePlay = {
    drawUi: jest.fn(),
    redrawPositions: jest.fn(),
  };

  const stateService = {
    load: jest.fn().mockImplementation(() => {
      throw new Error('Invalid state');
    }),
  };

  const gameController = new GameController(gamePlay, stateService);

  gameController.onLoadGame();

  expect(GamePlay.showError).toHaveBeenCalledWith(
    'Не удалось загрузить игру',
  );
});