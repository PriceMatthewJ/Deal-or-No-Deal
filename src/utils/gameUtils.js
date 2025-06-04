export function initializeCases(prizes) {
  const shuffledPrizes = [...prizes].sort(() => Math.random() - 0.5);
  return shuffledPrizes.map((prize, index) => ({
    id: index + 1,
    prize,
    isOpened: false,
  }));
}
