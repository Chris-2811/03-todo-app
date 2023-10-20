import './style.css';
import Sortable from 'sortablejs';

const itemListEl = document.getElementById('item-list');
const inputEl = document.getElementById('item-input');
const formEl = document.getElementById('form');
const totalItems = document.getElementById('total-items');
const clearItemsBtn = document.getElementById('clear-items');
const itemStats = document.getElementById('item-stats');
const mobileNav = document.getElementById('nav-mobile');
const allBtn = document.querySelectorAll('.all-btn');
const activeBtn = document.querySelectorAll('.active-btn');
const completedBtn = document.querySelectorAll('.completed-btn');

const toggleThemeBtn = document.getElementById('dark-mode-toggle');
const htmlEl = document.documentElement;

let filter = 'all';

// Add Item
function addItem(e) {
  e.preventDefault();

  const newItem = inputEl.value;

  if (inputEl.value.trim('') === '') {
    return;
  }

  if (!checkForDuplicates(newItem)) {
    addToDOM(newItem);

    addItemToLocalStorage(newItem);
  }

  updateUI();
  inputEl.value = '';
}

// Add Item to DOM
function addToDOM(newItem, checked) {
  const li = document.createElement('li');
  li.classList.add('list-item');
  if (checked) {
    li.classList.add('checked');
  }

  const container = document.createElement('div');
  container.classList.add('item-container');

  const circleBtn = createCircleBtn();
  const textNode = document.createTextNode(newItem);
  const deleteBtn = createDeleteBtn();

  container.appendChild(circleBtn);
  container.appendChild(textNode);

  li.appendChild(container);
  li.appendChild(deleteBtn);

  itemListEl.appendChild(li);
}

// Check for duplicates
function checkForDuplicates(newItem) {
  const items = getItemsFromLocalStorage();

  return items.includes(newItem);
}

// Create circle button
function createCircleBtn() {
  const div = document.createElement('div');
  div.classList.add('circle-icon');

  return div;
}

// Create delete button
function createDeleteBtn() {
  const img = document.createElement('img');
  img.setAttribute('src', './images/icon-cross.svg');
  img.classList.add('delete-icon');

  return img;
}

// Remove item
function removeItem(e) {
  if (e.target.classList.contains('delete-icon')) {
    e.target.parentElement.remove();
    removeItemFromLocalStorage(
      e.target.parentElement.querySelector('.item-container').textContent
    );

    updateUI();
  }
}

// Get items from local storage
function getItemsFromLocalStorage() {
  let items;

  if (localStorage.getItem('items') === null) {
    items = [];
  } else {
    items = JSON.parse(localStorage.getItem('items'));
  }

  return items;
}

// Add item to local storage
function addItemToLocalStorage(newItem) {
  let items = getItemsFromLocalStorage();

  items.push({
    text: newItem,
    checked: false,
  });

  localStorage.setItem('items', JSON.stringify(items));
}

// Remove item from local storage
function removeItemFromLocalStorage(removeItem) {
  let items = getItemsFromLocalStorage();

  items = items.filter((item) => {
    return item.text !== removeItem;
  });

  localStorage.setItem('items', JSON.stringify(items));
}

// Display items from local storage
function displayItemsFromLocalStorage() {
  let items = getItemsFromLocalStorage();

  items.forEach((item) => {
    addToDOM(item.text, item.checked);
  });

  updateUI();
}

// Clear from local Storage
function clearFromLocalStorage(clearItems) {
  let items = getItemsFromLocalStorage();

  console.log(clearItems);

  items = items.filter((item) => {
    return !clearItems.includes(item.text);
  });

  localStorage.setItem('items', JSON.stringify(items));

  updateUI();
}

// Check icon
function checkItem(e) {
  if (e.target.classList.contains('circle-icon')) {
    const itemContainer = e.target.parentElement.parentElement;
    itemContainer.classList.toggle('checked');

    const items = getItemsFromLocalStorage();
    const itemText = itemContainer.querySelector('.item-container').textContent;

    items.forEach((item) => {
      if (item.text === itemText) {
        item.checked = !item.checked;
      }
    });

    localStorage.setItem('items', JSON.stringify(items));
  }

  updateUI();
}

// Filter Items
function filterItems() {
  const items = document.querySelectorAll('.list-item');

  items.forEach((item) => {
    switch (filter) {
      case 'all':
        item.style.display = 'flex';
        break;
      case 'active':
        if (item.classList.contains('checked')) {
          item.style.display = 'none';
        } else {
          item.style.display = 'flex';
        }
        break;
      case 'completed':
        if (item.classList.contains('checked')) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
        break;
    }
  });
}

// Set filter
function setFilter(e) {
  const target = e.target;

  console.log(target);

  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach((item) => {
    item.classList.remove('active');
    e.target.classList.add('active');
  });

  if (target.classList.contains('all-btn')) {
    filter = 'all';
  } else if (target.classList.contains('active-btn')) {
    filter = 'active';
  } else if (target.classList.contains('completed-btn')) {
    filter = 'completed';
  }

  filterItems();
}

// Clear completed Item
function clearCompletedItems() {
  const items = document.querySelectorAll('.list-item');

  items.forEach((item) => {
    if (item.classList.contains('checked')) {
      item.remove();
      console.log(item.querySelector('.item-container').textContent);
      clearFromLocalStorage(item.querySelector('.item-container').textContent);
    }
  });
}

// Update UI
function updateUI() {
  const items = document.querySelectorAll('li');
  const checkedIcons = document.querySelectorAll('.list-item.checked');
  const itemsLeft = items.length - checkedIcons.length;

  totalItems.textContent = itemsLeft;

  if (items.length <= 0) {
    itemStats.style.display = 'none';
    mobileNav.style.display = 'none';
  } else {
    itemStats.style.display = 'flex';
    mobileNav.style.display = 'block';
  }
}

function initSortableList(listId) {
  const list = document.getElementById('item-list');

  new Sortable(list, {
    animation: 150,
    ghostClass: 'ghost',
    chosenClass: 'chosen',
    dragClass: 'drag',
    onUpdate: function (evt) {
      const items = document.querySelectorAll('.list-item');
      const itemsArray = [];
      items.forEach((item) => {
        const itemObj = {
          checked: item.classList.contains('checked'),
          text: item.querySelector('.item-container').textContent,
        };
        itemsArray.push(itemObj);
      });
      localStorage.setItem('items', JSON.stringify(itemsArray));
    },
  });
}

// Add Eventlistener
function init() {
  formEl.addEventListener('submit', addItem);
  itemListEl.addEventListener('click', removeItem);
  itemListEl.addEventListener('click', checkItem);

  activeBtn.forEach((btn) => {
    btn.addEventListener('click', setFilter);
  });
  completedBtn.forEach((btn) => {
    btn.addEventListener('click', setFilter);
  });
  allBtn.forEach((btn) => {
    btn.addEventListener('click', setFilter);
  });

  clearItemsBtn.addEventListener('click', clearCompletedItems);

  toggleThemeBtn.addEventListener('click', () => {
    if (htmlEl.getAttribute('data-theme') === 'light') {
      htmlEl.setAttribute('data-theme', 'dark');
      toggleThemeBtn.firstElementChild.setAttribute(
        'src',
        './images/icon-sun.svg'
      );
    } else {
      htmlEl.setAttribute('data-theme', 'light');
      toggleThemeBtn.firstElementChild.setAttribute(
        'src',
        './images/icon-moon.svg'
      );
    }
  });

  displayItemsFromLocalStorage();
  initSortableList();
}

init();
