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

let firstCard = null;
let secondCard = null;
let moves = 0;
let pairs = 0;
let isLocked = false;
let isFinished = false;
let closeTimer = null;

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
  card.dataset.index = index + 1;
  card.setAttribute('aria-label', `Карточка ${index + 1}, закрыта`);
  back.setAttribute('aria-hidden', 'true');
  image.src = `assets/${picture.file}`;
  image.alt = picture.name;
  image.draggable = false;
  card.append(back, image);
  card.addEventListener('click', () => openCard(card));

  return card;
}

function shuffleCards(cards) {
  for (let i = cards.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    const temporaryCard = cards[i];
    cards[i] = cards[randomIndex];
    cards[randomIndex] = temporaryCard;
  }

  return cards;
}

function updateCounters() {
  movesText.textContent = `Ходы: ${moves}`;
  pairsText.textContent = `Пары: ${pairs} из 8`;
}

function startNewGame() {
  clearTimeout(closeTimer);
  closeTimer = null;
  firstCard = null;
  secondCard = null;
  moves = 0;
  pairs = 0;
  isLocked = false;
  isFinished = false;
  updateCounters();
  board.replaceChildren();

  const cards = shuffleCards(pictures.concat(pictures));
  cards.forEach((picture, index) => {
    board.append(createCard(picture, index));
  });
}

function closeCard(card) {
  card.classList.remove('open');
  card.setAttribute('aria-label', `Карточка ${card.dataset.index}, закрыта`);
  card.removeAttribute('aria-disabled');
}

function openCard(card) {
  if (isLocked || isFinished || card.classList.contains('open')) {
    return;
  }

  card.classList.add('open');
  card.setAttribute('aria-label', card.querySelector('img').alt);
  card.setAttribute('aria-disabled', 'true');

  if (firstCard === null) {
    firstCard = card;
    return;
  }

  secondCard = card;
  moves += 1;

  if (firstCard.dataset.picture === secondCard.dataset.picture) {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    pairs += 1;
    firstCard = null;
    secondCard = null;
    updateCounters();

    if (pairs === 8) {
      isFinished = true;
    }
  } else {
    isLocked = true;
    updateCounters();
    closeTimer = setTimeout(() => {
      closeCard(firstCard);
      closeCard(secondCard);
      firstCard = null;
      secondCard = null;
      isLocked = false;
      closeTimer = null;
    }, 1000);
  }
}

newGameButton.addEventListener('click', startNewGame);
startNewGame();
