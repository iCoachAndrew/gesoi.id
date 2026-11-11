<?php
/**
 * Contoh Konfigurasi Database MySQL & Admin untuk Hostinger Web Hosting
 * Salin file ini menjadi config.php (atau letakkan sebagai ../../gesoi_config.php di luar public_html)
 */

return [
    'DB_HOST'        => 'localhost',
    'DB_NAME'        => 'u123456789_gesoi',
    'DB_USER'        => 'u123456789_gesoi',
    'DB_PASS'        => 'GANTI_PASSWORD_MYSQL_ANDA',

    'JWT_SECRET'     => 'ganti-dengan-kunci-rahasia-jwt-acak-minimal-32-karakter',
    'ADMIN_EMAIL'    => 'admin@gesoi.or.id',
    'ADMIN_PASSWORD' => 'GantiPasswordAdmin123!',

    'CORS_ORIGINS'   => '*',
];
