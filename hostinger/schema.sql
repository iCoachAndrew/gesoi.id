-- ============================================================================
-- Skema Database MySQL / MariaDB untuk Website GESOI (Hostinger Web Hosting)
-- Impor file ini melalui phpMyAdmin di hPanel Hostinger
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- 1. Tabel Admin Users
CREATE TABLE IF NOT EXISTS `users` (
  `email` VARCHAR(190) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `name` VARCHAR(100) NOT NULL DEFAULT 'Admin GESOI',
  `role` VARCHAR(30) NOT NULL DEFAULT 'admin',
  `created_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabel Proteksi Brute-Force Login (kunci 15 menit setelah 5 gagal)
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `identifier` VARCHAR(190) NOT NULL,
  `count` INT NOT NULL DEFAULT 0,
  `last_attempt` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`identifier`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabel Pendaftar (Relawan / Mitra / Donatur / Founding Circle)
CREATE TABLE IF NOT EXISTS `contacts` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `organization` VARCHAR(200) DEFAULT NULL,
  `interest` VARCHAR(50) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `created_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
   KEY `idx_contacts_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tabel Pesanan Publikasi Ilmiah
CREATE TABLE IF NOT EXISTS `orders` (
  `id` CHAR(36) NOT NULL,
  `publication_title` VARCHAR(255) NOT NULL,
  `price` VARCHAR(50) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `email` VARCHAR(190) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `organization` VARCHAR(200) DEFAULT NULL,
  `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
  `created_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_orders_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Tabel Konten CMS (Override di atas default i18n.js)
CREATE TABLE IF NOT EXISTS `site_content` (
  `id` VARCHAR(50) NOT NULL,
  `data` LONGTEXT NOT NULL,
  `updated_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Tabel Metadata Galeri Media (Upload Foto & Video)
CREATE TABLE IF NOT EXISTS `files` (
  `id` CHAR(36) NOT NULL,
  `storage_path` VARCHAR(255) NOT NULL,
  `original_filename` VARCHAR(255) NOT NULL,
  `content_type` VARCHAR(100) DEFAULT NULL,
  `size` BIGINT NOT NULL DEFAULT 0,
  `is_deleted` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_storage_path` (`storage_path`),
  KEY `idx_files_deleted_created` (`is_deleted`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Tabel Analitik Pengunjung Internal
CREATE TABLE IF NOT EXISTS `analytics` (
  `id` CHAR(36) NOT NULL,
  `type` VARCHAR(20) NOT NULL,
  `name` VARCHAR(60) DEFAULT NULL,
  `visitor_id` VARCHAR(64) NOT NULL,
  `lang` VARCHAR(5) DEFAULT NULL,
  `device` VARCHAR(10) DEFAULT NULL,
  `referrer` VARCHAR(200) DEFAULT NULL,
  `date` CHAR(10) NOT NULL,
  `created_at` VARCHAR(40) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_analytics_date_type` (`date`, `type`),
  KEY `idx_analytics_visitor` (`visitor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
