# The Cat-chen

Damla’s recipe website. Plain HTML, CSS, and JavaScript, with no build step or runtime dependencies.

## Run locally

Open a terminal in the project folder and start a local web server:

```sh
python -m http.server 8000
```

Open http://localhost:8000. Opening `index.html` directly from the filesystem will not load the JavaScript modules or recipe JSON correctly.

## Deploy

Upload the project files directly to your static host, with `index.html` at the site root. There is no build command.

The recipe image paths expect the site at the domain root, such as `recipes.damlairmak.com`.


## Editing recipes

Add or edit entries in `recipes.json`. Keep each recipe’s `id` unique and stable so saved favorites and recipe links continue to work. The recipe box displays the last entry first. The homepage features recipe `4` by default; change `featured` in `app.js` to choose another.

Instructions accept these entries:

```json
{ "type": "text", "content": "A numbered instruction." }
{ "type": "tip", "content": "An unnumbered cat tip." }
{ "type": "image", "url": "/assets/recipe1/garlic-bread3.webp" }
{ "type": "group", "images": ["/assets/recipe1/garlic-bread3.webp", "/assets/recipe1/garlic-bread4.webp"] }
```

Tips appear above the instructions. Process photos appear in the gallery below them. Put new photos in that recipe’s folder under `assets` and use their exact paths in the JSON. Folder numbers match recipe IDs. Within each folder, photo 1 shows the ingredients and has a recipe-specific filename ending in `1-ingredients.webp` (for example, `garlic-bread1-ingredients.webp`). Photo 2 is the cover; photos 3 onward are process photos in display order. Set `ingredientsImage` to photo 1 and `imageUrl` to photo 2 in `recipes.json`.

## Browser behavior

Saved favorites stay in the visitor’s browser on the same domain. They are not synced between devices. If browser storage is unavailable, favorites last for the current visit.

Cooking mode uses the Screen Wake Lock API on HTTPS or localhost. The page reports whether the screen lock is active and offers a retry when the device refuses or releases it. Switching pages or leaving cooking mode releases the lock. Device restrictions can override it.

The homepage cat plays a two-second winner jingle with confetti. The cat in A little hello plays a softer two-second bell jingle with colorful flowers. The confetti respects reduced-motion settings. Sound starts only after a click or tap.

Print recipe waits for photos and fonts, then opens the browser print dialog. Print styles remove navigation and controls and restore the full ingredient and instruction text, including checked items.

Fonts load from Google Fonts, with local serif and sans-serif fallbacks if unavailable. All recipe photos and audio are included locally.
