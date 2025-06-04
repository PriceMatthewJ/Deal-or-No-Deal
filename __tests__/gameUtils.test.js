import { initializeCases } from '../src/utils/gameUtils';

describe('initializeCases', () => {
  const prizes = [1, 2, 3, 4, 5, 6];

  test('randomizes case prizes', () => {
    const firstRun = initializeCases(prizes).map(c => c.prize).join(',');
    const secondRun = initializeCases(prizes).map(c => c.prize).join(',');
    // Very small chance these will be equal if shuffle happens to return the same order
    expect(firstRun).not.toEqual(secondRun);
  });
});
