# Permanent free image storage (Cloudinary) — self-hosted SWS

Render's free plan has no persistent disk, so anything written to `/uploads` is
deleted on every restart/redeploy. Store images on Cloudinary instead (free tier).

## 1. Create a Cloudinary account
- Sign up at https://cloudinary.com (free)
- Dashboard → copy **Cloud name**, **API Key**, **API Secret**

## 2. Add env vars on Render (API service → Environment)
```
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx
```

## 3. Install the package (in `apps/api`)
```
npm i cloudinary
```
(or add `"cloudinary": "^2.5.1"` to `apps/api/package.json` dependencies)

## 4. New file: `apps/api/src/upload.js`
```js
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// keep the file in memory, never on disk
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

export function uploadBuffer(buffer, folder = 'sws') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (err, result) => (err ? reject(err) : resolve(result.secure_url))
    );
    stream.end(buffer);
  });
}
```

## 5. Use it in your upload routes (`apps/api/src/routes/admin-core.js`)

Replace the old multer disk-storage import/route with:

```js
import { upload, uploadBuffer } from '../upload.js';

// Generic image upload -> returns a permanent https URL
router.post('/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = await uploadBuffer(req.file.buffer, 'sws/products');
    res.json({ url });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Upload failed' });
  }
});

// Homepage hero image
router.post('/settings/hero-image', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = await uploadBuffer(req.file.buffer, 'sws/hero');
    const s = await Settings.findOneAndUpdate({}, { hero_image_url: url }, { new: true, upsert: true });
    res.json({ hero_image_url: s.hero_image_url });
  } catch (e) {
    res.status(500).json({ message: e.message || 'Upload failed' });
  }
});
```

Delete any `express.static('/uploads')` line and the old `multer.diskStorage(...)` block.

## 6. Frontend
No change needed — the API now returns a full `https://res.cloudinary.com/...`
URL, which your `<img src={...}>` already renders. If your code prefixes URLs
with the API base (e.g. `` `${API}${p.image_url}` ``), make it conditional:

```js
const imgSrc = (u) => (u?.startsWith('http') ? u : `${API}${u}`);
```

## 7. Redeploy + re-upload
Old images stored on the ephemeral disk are gone permanently — re-upload each
product image once. From then on they persist forever.
