const pictures = [
  { name: 'Яблоко', file: 'apple.svg' },
  { name: 'Солнце', file: 'sun.svg' },
  { name: 'Звезда', file: 'star.svg' },
  { name: 'Сердце', file: 'heart.svg' },
  { name: 'Рыба', file: 'fish.svg' },
  { name: 'Дом', file: 'house.svg' },
  { name: 'Цветок', file: 'flower.svg' },
  { name: 'Дерево', file: 'tree.svg' },
];

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text) {
    element.textContent = text;
  }

  return element;
}

const game = createElement('main', 'game');
const header = createElement('header');
const title = createElement('h1', '', 'Memory Game');
const controls = createElement('div', 'controls');
const newGameButton = createElement('button', '', 'Новая игра');
const leadersButton = createElement('button', '', 'Таблица лидеров');
const counters = createElement('div', 'counters');
const movesText = createElement('p', '', 'Ходы: 0');
const pairsText = createElement('p', '', 'Пары: 0 из 8');
const board = createElement('div', 'board');
const instructions = createElement(
  'p',
  'instructions',
  'Открывайте по две карточки и находите одинаковые картинки. Найдите все 8 пар за наименьшее число ходов!',
);

newGameButton.type = 'button';
leadersButton.type = 'button';
counters.setAttribute('aria-live', 'polite');
board.setAttribute('aria-label', 'Игровое поле');
controls.append(newGameButton, leadersButton);
header.append(title, controls);
counters.append(movesText, pairsText);
game.append(header, counters, board, instructions);
document.body.append(game);

function createCard(picture, index) {
  const card = createElement('button', 'card');
  const back = createElement('span', '', '?');
  const image = createElement('img');

  card.type = 'button';
  card.dataset.picture = picture.file;
  card.setAttribute('aria-label', `Карточка ${index + 1}, закрыта`);
  back.setAttribute('aria-hidden', 'true');
  image.src = `assets/${picture.file}`;
  image.alt = picture.name;
  image.draggable = false;
  card.append(back, image);

  return card;
}

pictures.concat(pictures).forEach((picture, index) => {
  board.append(createCard(picture, index));
});
