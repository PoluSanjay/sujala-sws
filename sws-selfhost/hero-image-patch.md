# Homepage hero image — patch for `PoluSanjay/sws-ecommerce-crm`

5 edits. Apply in order, then restart API + rebuild web.

---

## 1. `apps/api/src/models.js`

In `settingsSchema`, add `hero_image_url` right after `gst_rate`:

```js
const settingsSchema = new Schema({
  singleton: { type: String, default: 'default', unique: true },
  free_shipping_threshold: { type: Number, default: 5000, min: 0 },
  flat_shipping_fee: { type: Number, default: 99, min: 0 },
  gst_rate: { type: Number, default: 0, min: 0, max: 100 },
  hero_image_url: { type: String, default: '' },      // <-- ADD THIS LINE
  smtp: {
```

---

## 2. `apps/api/src/routes/admin-core.js`

### 2a. imports (top of file) — add `fs`, `path`, `multer`

```js
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
```

### 2b. after `const router = Router();` add the uploader

```js
const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const heroUpload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, 'hero-' + Date.now() + path.extname(file.originalname).toLowerCase())
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\/(png|jpe?g|webp|avif)$/.test(file.mimetype))
});
```

### 2c. in `settingInput` (the zod schema), add one field

```js
const settingInput = z.object({
  free_shipping_threshold: z.coerce.number().min(0),
  flat_shipping_fee: z.coerce.number().min(0),
  gst_rate: z.coerce.number().min(0).max(100),
  hero_image_url: z.string().max(500).optional().or(z.literal('')),   // <-- ADD
  smtp: z.object({
```

### 2d. in `router.put('/settings', ...)`, include it in `$set`

```js
const settings = await AppSettings.findByIdAndUpdate(current._id, { $set: {
  free_shipping_threshold: input.free_shipping_threshold,
  flat_shipping_fee: input.flat_shipping_fee,
  gst_rate: input.gst_rate,
  hero_image_url: input.hero_image_url ?? current.hero_image_url ?? '',   // <-- ADD
  smtp
} }, { new: true, runValidators: true });
```

### 2e. add the upload endpoint (anywhere after the `/settings` routes)

```js
router.post('/settings/hero', heroUpload.single('image'), asyncRoute(async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Please choose a JPG, PNG or WebP image under 5 MB' });
  const current = await appSettings();
  const url = '/uploads/' + req.file.filename;
  await AppSettings.findByIdAndUpdate(current._id, { $set: { hero_image_url: url } });
  res.json({ hero_image_url: url });
}));
```

---

## 3. `apps/api/src/routes/catalog.js` — expose it publicly

In `router.get('/settings/public', ...)`, add a `branding` key to `res.json({ ... })`:

```js
  res.json({
    payment: payment ? { /* unchanged */ } : {},
    shipping: { free_shipping_threshold: app?.free_shipping_threshold ?? 5000, flat_shipping_fee: app?.flat_shipping_fee ?? 99, gst_rate: app?.gst_rate ?? 0 },
    branding: { hero_image_url: app?.hero_image_url || '' }        // <-- ADD
  });
```

---

## 4. `apps/web/src/portal.jsx` — admin control

### 4a. add `useRef` to the react import at the top

```js
import { useEffect, useRef, useState } from 'react';
```

### 4b. add this component just **above** `export function AdminPayment()`

```jsx
function HeroImageCard({ app, setSettings, refetchSettings }) {
  const toast = useToast(); const fileRef = useRef(null); const [busy, setBusy] = useState(false);
  const upload = async event => {
    const file = event.target.files?.[0]; if (!file) return;
    setBusy(true);
    try {
      const body = new FormData(); body.append('image', file);
      const result = await api('/admin/settings/hero', { method: 'POST', body });
      setSettings({ ...app, hero_image_url: result.hero_image_url });
      refetchSettings(); toast('Homepage image updated');
    } catch (error) { toast(error.message || 'Upload failed', 'error'); }
    setBusy(false); if (fileRef.current) fileRef.current.value = '';
  };
  return <form className="card grid gap-4 p-6 lg:col-span-2" onSubmit={event => { event.preventDefault(); action(() => api('/admin/settings', { method: 'PUT', body: app }), toast, refetchSettings, 'Homepage image saved'); }}>
    <h2 className="font-bold">Homepage hero image</h2>
    <p className="text-sm text-muted">Shown in the blue card on the homepage. Upload a photo or paste an image link.</p>
    <div className="grid gap-4 sm:grid-cols-[200px_1fr] sm:items-start">
      <div className="grid h-40 place-items-center overflow-hidden rounded-xl border border-line bg-mint">
        {app.hero_image_url ? <img src={imageUrl(app.hero_image_url)} alt="Homepage hero" className="h-full w-full object-cover"/> : <ImageOff className="text-muted" size={26}/>}
      </div>
      <div className="grid gap-3">
        <input ref={fileRef} type="file" accept="image/*" className="input" onChange={upload} disabled={busy}/>
        <label className="label">Or image URL<input className="input" value={app.hero_image_url || ''} onChange={event => setSettings({ ...app, hero_image_url: event.target.value })} placeholder="https://…"/></label>
        <div className="flex gap-3">
          <button className="btn btn-primary" disabled={busy}>{busy ? <LoaderCircle size={16} className="animate-spin"/> : <Save size={16}/>}Save image</button>
          {app.hero_image_url && <button type="button" className="btn btn-secondary" onClick={() => setSettings({ ...app, hero_image_url: '' })}><X size={16}/>Clear</button>}
        </div>
      </div>
    </div>
  </form>;
}
```

### 4c. render it inside `AdminPayment`

In the returned JSX of `AdminPayment`, the grid is
`<div className="grid gap-7 lg:grid-cols-2"> … </div>`.
Insert the card as the **first** child of that grid:

```jsx
<div className="grid gap-7 lg:grid-cols-2">
  <HeroImageCard app={app} setSettings={setSettings} refetchSettings={refetchSettings}/>
  <form className="card grid gap-4 p-6" onSubmit={savePayment}>
  …
```

`ImageOff`, `LoaderCircle`, `Save` and `X` are already imported in this file, and `imageUrl` must be in the `./lib.jsx` import list — add it if missing.

---

## 5. `apps/web/src/storefront.jsx` — show it on the homepage

Inside `export function Home()`, add a second query under the existing one:

```js
export function Home() {
  const { data, isLoading } = query('/products?limit=4', ['featured']);
  const { data: site } = query('/settings/public', ['public-settings']);   // <-- ADD
  const hero = site?.branding?.hero_image_url;                              // <-- ADD
```

Then in the hero card (the `<div className="card relative w-72 …">` block), replace **only** the inner placeholder:

```jsx
{/* BEFORE */}
<div className="grid h-48 place-items-center rounded-2xl border border-white/15 bg-slate-950/25"><Droplets size={92} className="text-white drop-shadow-xl"/></div>

{/* AFTER */}
<div className="grid h-48 place-items-center overflow-hidden rounded-2xl border border-white/15 bg-slate-950/25">
  {hero ? <img src={imageUrl(hero)} alt="Sujala Water Solutions purifier" className="h-full w-full object-cover"/> : <Droplets size={92} className="text-white drop-shadow-xl"/>}
</div>
```

---

## Checklist

- `apps/api` already has `multer` in `package.json` (used by `admin-catalog.js`) — no new install.
- `/uploads` is already served statically in `server.js` — nothing to add.
- Make sure `api()` in `lib.jsx` does **not** set `Content-Type` when the body is a `FormData` (the product upload already relies on this).
- Update the image at **Admin → Payments & settings → Homepage hero image**.
