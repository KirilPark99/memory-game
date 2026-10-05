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

const storageKey = 'memory-game-results';

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

modal.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') {
    return;
  }

  const buttons = modalButtons.querySelectorAll('button');
  const firstButton = buttons[0];
  const lastButton = buttons[buttons.length - 1];

  if (event.shiftKey && document.activeElement === firstButton) {
    event.preventDefault();
    lastButton.focus();
  } else if (!event.shiftKey && document.activeElement === lastButton) {
    event.preventDefault();
    firstButton.focus();
  }
});

function readResults() {
  try {
    const results = JSON.parse(localStorage.getItem(storageKey)) || [];

    if (!Array.isArray(results)) {
      return [];
    }

    return results.filter((result) => result
      && Number.isInteger(result.moves)
      && result.moves >= 8
      && Number.isFinite(result.date)
      && result.date > 0
      && !Number.isNaN(new Date(result.date).getTime()));
  } catch {
    return [];
  }
}

function sortResults(results) {
  return results.sort((a, b) => a.moves - b.moves || a.date - b.date).slice(0, 10);
}

function saveResult() {
  const results = readResults();
  results.push({ moves, date: Date.now() });

  try {
    localStorage.setItem(storageKey, JSON.stringify(sortResults(results)));
    return true;
  } catch {
    return false;
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

function showVictory(isSaved) {
  const content = createElement('div');
  const message = createElement('p', '', `Вы нашли все 8 пар! Количество ходов: ${moves}.`);
  content.append(message);

  if (!isSaved) {
    content.append(createElement('p', '', 'Не удалось сохранить результат. Проверьте, разрешено ли хранение данных в браузере.'));
  }

  openModal('Победа!', content, true);
}

function showLeaders() {
  const results = sortResults(readResults());

  if (results.length === 0) {
    const message = createElement('p', '', 'Пока нет результатов. Завершите игру!');
    openModal('Таблица лидеров', message, false);
    return;
  }

  const table = createElement('table');
  const tableHead = createElement('thead');
  const headRow = createElement('tr');
  const tableBody = createElement('tbody');

  ['Место', 'Ходы', 'Дата'].forEach((text) => {
    const cell = createElement('th', '', text);
    cell.scope = 'col';
    headRow.append(cell);
  });

  tableHead.append(headRow);

  results.forEach((result, index) => {
    const row = createElement('tr');
    row.append(
      createElement('td', '', String(index + 1)),
      createElement('td', '', String(result.moves)),
      createElement('td', '', formatDate(result.date)),
    );
    tableBody.append(row);
  });

  table.append(tableHead, tableBody);
  openModal('Таблица лидеров', table, false);
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
      const isSaved = saveResult();
      showVictory(isSaved);
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
