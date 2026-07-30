## Goal

Rewrite the uploaded self-host (MongoDB) files so the admin "add / edit product" screen looks like the Lovable-built Sujala site, and so the real SWS logo appears in the header/footer. Final code is delivered as full files you can paste into your project.

## What changes

### 1. `lib.jsx` — logo
- Replace the current text/icon `Logo` component with the real SWS mark, served from the existing CDN URL:
  `https://sujala-sws.lovable.app/__l5e/assets-v1/529ca140-c18d-4c04-9a92-a57b70cdac6b/sws-logo.png`
- `Logo` renders the round image + "SWS" wordmark + "Sujala Water Solutions" subtitle, with a `size` prop so the footer can use a smaller version.
- Also used as the favicon hint (you drop the same URL into `index.html`).

### 2. `portal.jsx` — `AdminProducts` restyle
Match the Lovable admin exactly:
- **Header band**: "Edit products" title, helper line ("Use each product card's Edit button to change price, stock, image and details"), "Add product" button on the right.
- **Product grid**: responsive cards (1 / 2 / 3 columns) with a square image (or "No image" placeholder), name, brand + Active/Hidden/Featured line, price in ₹ with struck-through original when a sale price exists, stock line, and a footer row with a full-width outlined "Edit price / image" button plus a red trash icon button.
- **Empty state**: dashed-border panel — "No products yet. Click Add product…".
- **Modal form**: same field order and grouping as the Lovable version — Name; Slug + Brand; Description; Price / Sale price / Stock (3-up); Warranty + Category; Image (preview thumb, URL field, Upload file button with spinner); Active + Featured checkboxes; Cancel / Save buttons. Keeps the existing FormData + multi-file upload wiring so the Express/Mongo API contract is unchanged.
- Auto-slug from the name while typing on new products.

### 3. `styles.css` — supporting tokens
Add the few utility classes the new markup needs (`.chip`, `.card-hover` lift/shadow on hover, thumbnail and dashed empty-state helpers) using the existing token palette. No palette change.

## Technical notes
- No backend/API changes: same `/admin/products` GET/POST/PUT/DELETE endpoints, same `images` + `existing_images` FormData fields.
- `brand`, `warranty`, `is_featured` are sent as plain fields; if your Mongoose product schema lacks them, add those three fields to the schema (noted in the delivery message).
- Files are written to the project's Files panel as downloadable `.jsx`/`.css`, and the full code is also printed in chat.
