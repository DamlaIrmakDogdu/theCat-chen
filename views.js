const entities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => entities[character]);
}

export function recipeCard(recipe, isSaved) {
  const name = escapeHtml(recipe.name);
  const id = escapeHtml(recipe.id);

  return `
    <article class="card">
      <a class="card-image" href="#recipe/${id}">
        <img src="${escapeHtml(recipe.imageUrl)}" alt="${name}" loading="lazy">
      </a>
      <button class="save" type="button" data-save="${id}"
        aria-label="${isSaved ? 'Remove' : 'Save'} ${name}${isSaved ? ' from saved recipes' : ''}"
        aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>
      <div class="card-body">
        <span class="tag">${recipe.tags.map(escapeHtml).join(' · ')}</span>
        <h3><a href="#recipe/${id}">${name}</a></h3>
        <p>${escapeHtml(recipe.description)}</p>
      </div>
    </article>
  `;
}

export function aboutSection(showSurpriseNote = false) {
  return `
    <section class="hello">
      <button class="apron-cat" type="button" data-celebrate="${showSurpriseNote ? 'flowers' : 'confetti'}" aria-label="Celebrate with the cat">
        <img src="assets/branding/logo.png" alt="" width="115" height="115">
      </button>
      <div>
        <span class="eyebrow">The cat behind the apron</span>
        <h2>Hi, I’m Damla!</h2>
        <p>I created this space to share some of my favorite recipes~ or the ones i had time to take photos of at least! I hope my ideas bring warmth and inspiration to your kitchen. :&gt;</p>
        ${showSurpriseNote ? '<p>Also as a thank you for reading this part, please click on the cat to discover a little surprise. You can also click on the cat in the main page, they show different things.</p>' : ''}
      </div>
    </section>
  `;
}

export function recipeCollection(categories, selectedCategory, query, savedOnly) {
  return `
    <section class="collection" aria-label="Recipe collection">
      <div class="section-heading">
        <div>
          <h2>${savedOnly ? 'Your little favorites' : 'The recipe box'}</h2>
          <p id="result-count" role="status"></p>
        </div>
        <label class="search">
          <span aria-hidden="true">⌕</span>
          <input type="search" placeholder="Find something delicious…"
            aria-label="Search recipes" value="${escapeHtml(query)}">
        </label>
      </div>
      <div class="filters" aria-label="Recipe categories">
        ${categories.map(category => `
          <button type="button" data-filter="${escapeHtml(category)}"
            aria-pressed="${selectedCategory === category}">${escapeHtml(category)}</button>
        `).join('')}
      </div>
      <div class="grid" id="recipe-grid"></div>
    </section>
  `;
}

export function homePage(featuredRecipe, collection) {
  return `
    <section class="hero">
      <div>
        <h1>Good food means<br><em>happy belly.</em></h1>
        <p>A few favorite recipes from my kitchen to yours. Hopefully you’ll find something you like.</p>
        <a class="button" href="#recipes">Open the recipe box</a>
      </div>
      <a class="feature" href="#recipe/${escapeHtml(featuredRecipe.id)}">
        <img src="${escapeHtml(featuredRecipe.imageUrl)}" alt="${escapeHtml(featuredRecipe.name)}">
        <span class="feature-caption">${escapeHtml(featuredRecipe.name)}</span>
      </a>
    </section>
    <div class="separator" aria-hidden="true"></div>
    ${collection}
    ${aboutSection()}
  `;
}

export function collectionPage(collection, savedOnly) {
  return `
    <div class="page-intro${savedOnly ? '' : ' recipe-intro'}">
      ${savedOnly ? '<span class="eyebrow">For another delicious day</span>' : ''}
      <h1>${savedOnly ? 'Keep the <em>good ones.</em>' : 'Pick your next <em>bake.</em>'}</h1>
    </div>
    ${collection}
  `;
}

export function aboutPage() {
  return `
    <section class="love-intro"><h1>lots of love</h1></section>
    ${aboutSection(true)}
    <section class="support">
      <h2>Thank you for your interest~</h2>
      <p>If you'd like to support me... thank you! This truly means a lot. This little site is a cozy passion project I'm still building with love. More ways to contribute or get involved will be added soon. 🌱</p>
      <p>For the time being, you can visit my <a href="https://damlairmak.com">personal website</a> to check out more projects of mine or let me know of what you think about my recipes and request for more recipes :&gt; 💛</p>
    </section>
  `;
}

export function emptyCollection(noSavedRecipes) {
  return `
    <div class="empty">
      <h3>${noSavedRecipes ? 'A little space for your favorites ♡' : 'No recipes found.'}</h3>
      <p>${noSavedRecipes ? 'Tap the heart on a recipe to keep it here on this device.' : 'Try another search or category.'}</p>
      <button class="plain-button" type="button" data-reset>Show all recipes</button>
    </div>
  `;
}

export function messagePage(title, message) {
  return `
    <section class="page-intro">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(message)}</p>
      <a class="button" href="#recipes">Back to the recipe box</a>
    </section>
  `;
}

export function recipePage(recipe) {
  const name = escapeHtml(recipe.name);
  const steps = recipe.instructions.filter(item => item.type === 'text');
  const tips = recipe.instructions.filter(item => item.type === 'tip');
  const photos = recipe.instructions.flatMap(item => item.images || (item.url ? [item.url] : []));

  return `
    <a class="back" href="#recipes">Back to the recipe box</a>
    <article>
      <div class="recipe-hero">
        <img src="${escapeHtml(recipe.imageUrl)}" alt="${name}">
        <div>
          <h1>${name}</h1>
          <p>${escapeHtml(recipe.description)}</p>
          <div class="actions">
            <button class="button" type="button" data-cooking aria-pressed="false">Cooking mode</button>
            <button class="plain-button" type="button" data-print>Print recipe</button>
            <button class="plain-button" type="button" data-retry-wake hidden>Retry screen wake lock</button>
          </div>
          <p class="wake-status" role="status" id="wake-status">Cooking mode can keep your screen awake while this page is open.</p>
        </div>
      </div>
      <section class="ingredients-section" aria-labelledby="ingredients-title">
        <div class="ingredient-photo">
          <h2 id="ingredients-title">Ingredients</h2>
          <img src="${escapeHtml(recipe.ingredientsImage)}" alt="Ingredients for ${name}">
        </div>
        <div class="ingredients">
          <h3>Measured ingredients</h3>
          <p>Tick things off as you go.</p>
          <ul class="ingredient-list">
            ${recipe.ingredients.map((ingredient, index) => `
              <li><label>
                <input type="checkbox" name="ingredient-${index}">
                <span>${escapeHtml(ingredient)}</span>
              </label></li>
            `).join('')}
          </ul>
        </div>
      </section>
      <section class="method">
        ${tips.length ? `
          <aside class="cat-tip">
            <h3>cat tip</h3>
            ${tips.map(tip => `<p>${escapeHtml(tip.content.replace(/^tip\s*:\s*/i, ''))}</p>`).join('')}
          </aside>
        ` : ''}
        <h2>Recipe instructions</h2>
        <ol class="method-steps">
          ${steps.map((step, index) => `
            <li class="step">
              <button type="button" data-step aria-label="Mark step ${index + 1} complete"
                aria-pressed="false">${index + 1}</button>
              <p>${escapeHtml(step.content)}</p>
            </li>
          `).join('')}
        </ol>
      </section>
      ${photos.length ? `
        <section class="process" aria-labelledby="process-title">
          <h2 id="process-title">Process photos</h2>
          <div class="process-gallery">
            ${photos.map((photo, index) => `
              <figure>
                <a href="${escapeHtml(photo)}" target="_blank" rel="noopener"
                  aria-label="Open process photo ${index + 1} at full size">
                  <img src="${escapeHtml(photo)}" alt="${name}, process photo ${index + 1}" decoding="async">
                </a>
              </figure>
            `).join('')}
          </div>
        </section>
      ` : ''}
    </article>
  `;
}
