# SPIDER — Company Website + Admin

## Structure
```
index.html              Site (content rendered from data/content.json)
assets/css/style.css    Design system (Noir & Gold)
assets/js/content.js    Default content (fallback)
assets/js/main.js       Rendering, 3D hero (Three.js), scroll motion (GSAP)
admin/                  Admin panel  →  /admin
api/index.php           Admin API (login, save, upload, messages, password)
api/config.php          ⚠ Set ADMIN_PASSWORD (and NOTIFY_EMAIL) before deploying
contact.php             Contact form → stored in admin inbox (+ optional email)
data/content.json       Live site content (written by the admin)
uploads/                Images uploaded from the admin
```

## Deploy (any PHP 8+ hosting, Apache)
1. Upload the whole folder.
2. Edit `api/config.php`: change `ADMIN_PASSWORD` from `change-me` (login is blocked until you do).
3. Make `data/` and `uploads/` writable by PHP (e.g. 755/775).
4. Open `/admin`, log in, edit content, press **حفظ ونشر**.
   Change the password later from **الأمان**.

`.htaccess` files block direct access to private data (messages, admin hash) and script execution in `uploads/`.
On Nginx, add equivalent `deny` rules for `/data/` (except `content.json`), `/api/config.php` and `*.php` in `/uploads/`.

## Without PHP
The admin runs in preview mode: edits are kept in the browser (localStorage) and can be exported as `content.json`
and uploaded to `data/` manually.

## Local preview
```
php -S localhost:8000
```
