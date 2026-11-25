<?php
/**
 * SPIDER admin configuration — EDIT BEFORE DEPLOYING.
 * Set a strong initial password. After first login you can change it from the
 * admin panel (Settings → Security); the new one is stored hashed in data/admin.json.
 * Login is refused while the password is still "change-me".
 */
const ADMIN_USER = 'admin';
const ADMIN_PASSWORD = 'change-me';

// Where contact-form messages are emailed (leave empty to only store them in the admin inbox)
const NOTIFY_EMAIL = '';

const DATA_DIR = __DIR__ . '/../data';
const UPLOAD_DIR = __DIR__ . '/../uploads';
