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

const modal = createElement('dialog', 'modal');
const modalTitle = createElement('h2');
const modalContent = createElement('div');
const modalButtons = createElement('div', 'modal-buttons');
modalTitle.id = 'modal-title';
modal.setAttribute('aria-labelledby', modalTitle.id);
modal.append(modalTitle, modalContent, modalButtons);
document.body.append(modal);

function closeModal() {
  modal.close();
  document.body.classList.remove('modal-open');
}

function openModal(title, content, canRestart) {
  modalTitle.textContent = title;
  modalContent.replaceChildren(content);
  modalButtons.replaceChildren();

  if (canRestart) {
    const restartButton = createElement('button', '', 'Новая игра');
    restartButton.type = 'button';
    restartButton.addEventListener('click', startNewGame);
    modalButtons.append(restartButton);
  }

  const closeButton = createElement('button', '', 'Закрыть');
  closeButton.type = 'button';
  closeButton.addEventListener('click', closeModal);
  modalButtons.append(closeButton);
  modal.showModal();
  document.body.classList.add('modal-open');
}

modal.addEventListener('click', (event) => {
  const rectangle = modal.getBoundingClientRect();
  const outside = event.clientX < rectangle.left
    || event.clientX > rectangle.right
    || event.clientY < rectangle.top
    || event.clientY > rectangle.bottom;

  if (event.target === modal && outside) {
    closeModal();
  }
});

modal.addEventListener('close', () => {
  if (!modal.open) {
    document.body.classList.remove('modal-open');
  }
});

function showVictory() {
  const message = createElement('p', '', `Вы нашли все 8 пар! Количество ходов: ${moves}.`);
  openModal('Победа!', message, true);
}

function showLeaders() {
  const message = createElement('p', '', 'Пока нет результатов. Завершите игру!');
  openModal('Таблица лидеров', message, false);
}

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
  if (modal.open) {
    closeModal();
  }

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
  if (modal.open || isLocked || isFinished || card.classList.contains('open')) {
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
      showVictory();
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
leadersButton.addEventListener('click', showLeaders);
startNewGame();
