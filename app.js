import {
  aboutPage,
  collectionPage,
  emptyCollection,
  homePage,
  messagePage,
  recipeCard,
  recipeCollection,
  recipePage,
} from './views.js';
import {
  acquireScreenLock,
  celebrateCat,
  printRecipe,
  stopCooking,
  toast,
  toggleCooking,
} from './effects.js';

const main = document.querySelector('main');
const savedCount = document.querySelector('#saved-count');
const storageKey = 'damla-saved';
let recipes = [];
let categories = [];
let saved = new Set();
let selectedCategory = 'All';
let query = '';
let loadFailed = false;

function readSavedRecipes() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!Array.isArray(stored)) return new Set();
    return new Set(stored.filter(id => recipes.some(recipe => recipe.id === id)));
  } catch {
    return new Set();
  }
}

function updateSavedCount() {
  savedCount.textContent = saved.size;
}

function toggleSavedRecipe(id, button) {
  const recipe = recipes.find(item => item.id === id);
  if (!recipe) return;

  saved.has(id) ? saved.delete(id) : saved.add(id);

  try {
    localStorage.setItem(storageKey, JSON.stringify([...saved]));
  } catch {
    toast('Saved for this visit. Browser storage is unavailable.');
  }

  const isSaved = saved.has(id);
  button.setAttribute('aria-pressed', isSaved);
  button.setAttribute('aria-label', isSaved
    ? `Remove ${recipe.name} from saved recipes`
    : `Save ${recipe.name}`);
  button.textContent = isSaved ? '♥' : '♡';
  updateSavedCount();
  if (location.hash === '#saved') updateCollection();
}

function updateCollection() {
  const grid = document.querySelector('#recipe-grid');
  if (!grid) return;

  const savedOnly = location.hash === '#saved';
  const search = query.toLowerCase().trim();
  const matches = [...recipes].reverse().filter(recipe => {
    const inSaved = !savedOnly || saved.has(recipe.id);
    const inCategory = selectedCategory === 'All' || recipe.tags.includes(selectedCategory);
    const searchText = `${recipe.name} ${recipe.tags.join(' ')} ${recipe.ingredients.join(' ')}`;
    return inSaved && inCategory && searchText.toLowerCase().includes(search);
  });

  grid.innerHTML = matches.length
    ? matches.map(recipe => recipeCard(recipe, saved.has(recipe.id))).join('')
    : emptyCollection(savedOnly && saved.size === 0);

  document.querySelector('#result-count').textContent =
    `${matches.length} ${matches.length === 1 ? 'recipe' : 'recipes'} · made at home, shared with love`;

  document.querySelectorAll('[data-filter]').forEach(button => {
    button.setAttribute('aria-pressed', button.dataset.filter === selectedCategory);
  });
  shapeCards();
}

function shapeCards() {
  const grid = document.querySelector('#recipe-grid');
  if (!grid) return;

  const cards = [...grid.querySelectorAll('.card-image')];
  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
  const finalRow = Math.floor((cards.length - 1) / columns);

  cards.forEach((card, index) => {
    const row = Math.floor(index / columns);
    const first = index % columns === 0;
    const last = index % columns === columns - 1 || index === cards.length - 1;
    const corners = [
      row === 0 && first,
      row === 0 && last,
      row === finalRow && last,
      row === finalRow && first,
    ];
    card.style.borderRadius = corners.map(rounded => rounded ? '85px' : '8px').join(' ');
  });
}

function renderPage() {
  stopCooking();
  const page = location.hash.slice(1) || 'home';
  const recipe = page.startsWith('recipe/')
    ? recipes.find(item => item.id === page.slice(7))
    : null;

  document.title = recipe ? `${recipe.name} · The Cat-chen` : 'The Cat-chen ♡';
  document.querySelectorAll('nav a').forEach(link => {
    const active = link.dataset.tab === page || (recipe && link.dataset.tab === 'recipes');
    if (active) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });

  if (loadFailed && page !== 'about') {
    main.innerHTML = messagePage('The recipe box couldn’t load.', 'Please refresh the page to try again.');
  } else if (recipe) {
    main.innerHTML = recipePage(recipe);
  } else if (page === 'about') {
    main.innerHTML = aboutPage();
  } else if (['home', 'recipes', 'saved'].includes(page)) {
    const savedOnly = page === 'saved';
    const collection = recipeCollection(categories, selectedCategory, query, savedOnly);
    const featured = recipes.find(item => item.id === '4') || recipes[0];
    main.innerHTML = page === 'home' && featured
      ? homePage(featured, collection)
      : collectionPage(collection, savedOnly);
    updateCollection();
  } else {
    main.innerHTML = messagePage('Page not found.', 'You can find all the recipes in the recipe box.');
  }

  window.scrollTo(0, 0);
}

function resetFilters() {
  selectedCategory = 'All';
  query = '';
  const search = main.querySelector('input[type="search"]');
  if (search) search.value = '';
  if (location.hash === '#saved') location.hash = 'recipes';
  else updateCollection();
}

function openRandomRecipe() {
  const choices = recipes.filter(recipe => location.hash !== `#recipe/${recipe.id}`);
  if (!choices.length) return;
  const recipe = choices[Math.floor(Math.random() * choices.length)];
  location.hash = `recipe/${recipe.id}`;
}

function handleClick(event) {
  if (event.target.closest('.skip')) {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
    return;
  }

  const button = event.target.closest('button');
  if (!button) return;

  if (button.hasAttribute('data-celebrate')) {
    celebrateCat(button);
  } else if (button.hasAttribute('data-save')) {
    toggleSavedRecipe(button.dataset.save, button);
  } else if (button.hasAttribute('data-filter')) {
    selectedCategory = button.dataset.filter;
    updateCollection();
  } else if (button.hasAttribute('data-reset')) {
    resetFilters();
  } else if (button.hasAttribute('data-step')) {
    const complete = button.getAttribute('aria-pressed') !== 'true';
    button.setAttribute('aria-pressed', complete);
    button.closest('.step').classList.toggle('done', complete);
  } else if (button.hasAttribute('data-cooking')) {
    toggleCooking();
  } else if (button.hasAttribute('data-retry-wake')) {
    acquireScreenLock();
  } else if (button.hasAttribute('data-print')) {
    printRecipe(button);
  } else if (button.id === 'surprise') {
    openRandomRecipe();
  }
}

async function init() {
  try {
    const response = await fetch('recipes.json');
    if (!response.ok) throw new Error(`Recipe request failed: ${response.status}`);
    recipes = await response.json();
    if (!Array.isArray(recipes)) throw new Error('Expected a recipe list.');
  } catch {
    recipes = [];
    loadFailed = true;
  }

  categories = ['All', ...new Set(recipes.flatMap(recipe => recipe.tags))];
  saved = readSavedRecipes();
  updateSavedCount();
  document.querySelector('#surprise').disabled = recipes.length === 0;
  document.addEventListener('click', handleClick);
  document.addEventListener('input', event => {
    if (event.target.matches('input[type="search"]')) {
      query = event.target.value;
      updateCollection();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') acquireScreenLock();
  });
  window.addEventListener('pagehide', stopCooking);
  window.addEventListener('resize', shapeCards);
  window.addEventListener('hashchange', renderPage);
  renderPage();
}

init();
