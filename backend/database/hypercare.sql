-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 05, 2026 at 06:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hypercare`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `role` enum('pasien','perawat','admin') NOT NULL,
  `aksi` varchar(100) NOT NULL,
  `deskripsi` varchar(255) DEFAULT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`id`, `user_id`, `role`, `aksi`, `deskripsi`, `entity_type`, `entity_id`, `created_at`) VALUES
(1, 1, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-01 08:40:23'),
(2, 1, 'pasien', 'catat_tekanan', 'Mencatat tekanan darah 120/80 mmHg', 'tekanan_darah', NULL, '2026-07-01 08:40:23'),
(3, 1, 'pasien', 'edit_profil', 'Memperbarui informasi profil', 'profil', NULL, '2026-07-01 08:40:23'),
(4, 6, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-02 09:29:44'),
(5, 6, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-02 09:30:05'),
(6, 6, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-02 09:30:38'),
(7, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-04 01:00:42'),
(8, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-04 01:01:06'),
(9, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-04 01:03:21'),
(10, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-05 03:26:18'),
(11, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-05 03:26:21'),
(12, 7, 'pasien', 'login', 'Berhasil masuk ke akun', 'auth', NULL, '2026-07-05 03:26:22');

-- --------------------------------------------------------

--
-- Table structure for table `ai_conversations`
--

CREATE TABLE `ai_conversations` (
  `id` int(10) UNSIGNED NOT NULL,
  `pasien_id` int(10) UNSIGNED NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `message` text NOT NULL,
  `recommended_edukasi_ids` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_perawat`
--

CREATE TABLE `chat_perawat` (
  `id` int(10) UNSIGNED NOT NULL,
  `pasien_id` int(10) UNSIGNED NOT NULL,
  `perawat_id` int(10) UNSIGNED NOT NULL,
  `pengirim` enum('pasien','perawat') NOT NULL,
  `pesan` text NOT NULL,
  `dibaca` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `edukasi`
--

CREATE TABLE `edukasi` (
  `id` int(10) UNSIGNED NOT NULL,
  `judul` varchar(300) NOT NULL,
  `ringkasan` text DEFAULT NULL,
  `isi` longtext DEFAULT NULL,
  `thumbnail` varchar(500) DEFAULT NULL,
  `kategori` varchar(100) DEFAULT NULL,
  `penulis` varchar(150) NOT NULL,
  `sumber` varchar(100) DEFAULT NULL,
  `waktu_baca` tinyint(3) UNSIGNED DEFAULT 3,
  `url_artikel` varchar(500) DEFAULT NULL,
  `url_video` varchar(500) DEFAULT NULL,
  `url_reel` varchar(500) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `edukasi`
--

INSERT INTO `edukasi` (`id`, `judul`, `ringkasan`, `isi`, `thumbnail`, `kategori`, `penulis`, `sumber`, `waktu_baca`, `url_artikel`, `url_video`, `url_reel`, `is_published`, `created_at`, `updated_at`) VALUES
(1, 'Apa Itu Hipertensi? Penyebab, Gejala, dan Pencegahannya', 'Hipertensi atau tekanan darah tinggi adalah kondisi ketika tekanan darah secara konsisten berada di atas 130/80 mmHg. Kondisi ini sering disebut silent killer karena jarang menunjukkan gejala di awal.', NULL, 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600', 'Pengertian', 'Tim Medis Alodokter', 'Alodokter', 5, 'https://www.alodokter.com/hipertensi', 'https://www.youtube.com/watch?v=ab5GYzl4RBk', NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(2, 'Cara Menurunkan Tekanan Darah Secara Alami', 'Perubahan gaya hidup seperti diet DASH, olahraga rutin, dan mengelola stres terbukti efektif menurunkan tekanan darah tanpa ketergantungan obat.', NULL, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600', 'Pengobatan', 'WHO Editorial Team', 'WHO', 4, 'https://www.who.int/news-room/fact-sheets/detail/hypertension', 'https://www.youtube.com/watch?v=AqrIInJr2oM', 'https://www.instagram.com/reel/C1234567890/', 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(3, 'Diet DASH: Pola Makan Terbaik untuk Penderita Hipertensi', 'Diet DASH (Dietary Approaches to Stop Hypertension) adalah pola makan khusus yang dirancang untuk membantu menurunkan tekanan darah dengan membatasi sodium dan meningkatkan konsumsi kalium.', NULL, 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600', 'Nutrisi', 'Tim Ahli Gizi Halodoc', 'Halodoc', 6, 'https://www.halodoc.com/artikel/apa-itu-diet-dash', 'https://www.youtube.com/watch?v=oCKAqPNvjh0', NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(4, 'Olahraga yang Aman untuk Penderita Hipertensi', 'Aktivitas fisik teratur dapat menurunkan tekanan darah sistolik hingga 5-8 mmHg. Pelajari jenis olahraga yang aman dan durasinya untuk penderita hipertensi.', NULL, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', 'Gaya Hidup', 'Tim Mayo Clinic', 'Mayo Clinic', 5, 'https://www.mayoclinic.org/diseases-conditions/high-blood-pressure/in-depth/high-blood-pressure/art-20045206', 'https://www.youtube.com/watch?v=oCKAqPNvjh0', 'https://www.instagram.com/reel/C9876543210/', 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(5, 'Komplikasi Hipertensi yang Perlu Diwaspadai', 'Hipertensi yang tidak ditangani dapat memicu serangan jantung, stroke, gagal ginjal, dan kerusakan pembuluh darah. Pahami risikonya untuk termotivasi rutin kontrol.', NULL, 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600', 'Risiko', 'Tim Medis Cleveland Clinic', 'Cleveland Clinic', 7, 'https://my.clevelandclinic.org/health/diseases/4314-hypertension-high-blood-pressure', 'https://www.youtube.com/shorts/ab5GYzl4RBk', NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(6, 'Panduan Mengukur Tekanan Darah di Rumah', 'Pengukuran tekanan darah mandiri di rumah membantu memantau kondisi hipertensi lebih akurat. Ketahui waktu terbaik, posisi yang benar, dan cara membaca hasilnya.', NULL, 'https://images.unsplash.com/photo-1666214277411-7fd9613abcc3?w=600', 'Pemantauan', 'Tim SATUSEHAT Kemenkes RI', 'SATUSEHAT', 4, 'https://satusehat.kemkes.go.id/', 'https://www.youtube.com/watch?v=AqrIInJr2oM', 'https://www.instagram.com/reel/C5555555555/', 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(7, 'Obat Antihipertensi: Jenis, Manfaat, dan Efek Samping', 'Terdapat berbagai golongan obat antihipertensi mulai dari ACE inhibitor hingga diuretik. Pahami cara kerjanya dan pentingnya tidak menghentikan konsumsi obat tanpa petunjuk dokter.', NULL, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600', 'Pengobatan', 'Tim Editorial NHS', 'NHS', 8, 'https://www.nhs.uk/conditions/high-blood-pressure-hypertension/treatment/', NULL, NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(8, 'Faktor Risiko Hipertensi yang Perlu Anda Ketahui', 'Usia, riwayat keluarga, kelebihan berat badan, kurang gerak, dan konsumsi garam berlebih adalah faktor risiko utama hipertensi. Identifikasi risiko Anda sejak dini.', NULL, 'https://images.unsplash.com/photo-1490819640566-8d294e8e6e36?w=600', 'Risiko', 'Tim CDC', 'CDC', 5, 'https://www.cdc.gov/bloodpressure/risk_factors.htm', 'https://www.youtube.com/watch?v=ab5GYzl4RBk', NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(9, 'Hipertensi pada Ibu Hamil (Preeklampsia)', 'Preeklampsia adalah komplikasi serius hipertensi saat kehamilan. Kenali tanda-tanda, cara pencegahan, dan penanganannya untuk keselamatan ibu dan bayi.', NULL, 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600', 'Khusus', 'Direktorat Kesehatan Ibu Kemenkes RI', 'Kemenkes RI', 6, 'https://www.kemkes.go.id/article/view/20073100002/hipertensi-dalam-kehamilan.html', 'https://www.youtube.com/watch?v=AqrIInJr2oM', 'https://www.instagram.com/reel/C7777777777/', 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23');

-- --------------------------------------------------------

--
-- Table structure for table `konsultasi`
--

CREATE TABLE `konsultasi` (
  `id` int(10) UNSIGNED NOT NULL,
  `pasien_id` int(10) UNSIGNED NOT NULL,
  `perawat_id` int(10) UNSIGNED NOT NULL,
  `tanggal` datetime NOT NULL,
  `keluhan` text DEFAULT NULL,
  `status` enum('menunggu','aktif','selesai','dibatalkan') DEFAULT 'menunggu',
  `catatan` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `role` enum('pasien','perawat','admin') NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `device` varchar(100) DEFAULT NULL,
  `status` enum('sukses','gagal') DEFAULT 'sukses',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`id`, `user_id`, `role`, `ip_address`, `user_agent`, `device`, `status`, `created_at`) VALUES
(1, 1, 'pasien', '127.0.0.1', NULL, 'Chrome di Windows', 'sukses', '2026-07-01 08:40:23'),
(2, 1, 'pasien', '127.0.0.1', NULL, 'Safari di iPhone', 'sukses', '2026-07-01 08:40:23'),
(3, 6, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-02 09:29:44'),
(4, 6, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-02 09:30:05'),
(5, 6, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-02 09:30:38'),
(6, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-04 01:00:42'),
(7, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-04 01:01:06'),
(8, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-04 01:03:21'),
(9, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-05 03:26:18'),
(10, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-05 03:26:21'),
(11, 7, 'pasien', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36 Edg/149.0.0.0', 'Edge di Windows', 'sukses', '2026-07-05 03:26:22');

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `role` enum('pasien','perawat') NOT NULL,
  `judul` varchar(200) NOT NULL,
  `pesan` text NOT NULL,
  `tipe` enum('info','sukses','peringatan','bahaya') DEFAULT 'info',
  `dibaca` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifikasi`
--

INSERT INTO `notifikasi` (`id`, `user_id`, `role`, `judul`, `pesan`, `tipe`, `dibaca`, `created_at`) VALUES
(1, 1, 'pasien', 'Tekanan Darah Perlu Diperhatikan', 'Tekanan darah Anda pada 29 Mei menunjukkan Pra Hipertensi. Harap pantau secara rutin.', 'peringatan', 0, '2026-07-01 08:40:23'),
(2, 1, 'pasien', 'Jadwal Konsultasi Besok', 'Anda memiliki jadwal konsultasi dengan Ns. Siti Aisyah besok pukul 10:00 WIB.', 'info', 0, '2026-07-01 08:40:23'),
(3, 1, 'pasien', 'Selamat Datang di HyperCare', 'Akun Anda berhasil dibuat. Mulai pantau tekanan darah Anda sekarang!', 'sukses', 0, '2026-07-01 08:40:23');

-- --------------------------------------------------------

--
-- Table structure for table `pasien`
--

CREATE TABLE `pasien` (
  `id` int(10) UNSIGNED NOT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `no_hp` varchar(20) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `agama` varchar(50) DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pasien`
--

INSERT INTO `pasien` (`id`, `nama`, `email`, `password`, `no_hp`, `jenis_kelamin`, `tanggal_lahir`, `agama`, `alamat`, `foto`, `created_at`, `updated_at`) VALUES
(1, 'Budi Santoso', 'pasien@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0812-3456-7001', 'Laki-laki', '1971-03-15', 'Islam', 'Jl. Mawar No. 1, Jakarta', NULL, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(2, 'Siti Rahma', 'siti@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0812-3456-7002', 'Perempuan', '1964-07-20', 'Islam', 'Jl. Melati No. 5, Bandung', NULL, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(3, 'Agus Salim', 'agus@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0812-3456-7003', 'Laki-laki', '1978-05-10', 'Islam', 'Jl. Kenanga No. 3, Surabaya', NULL, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(4, 'Maria Goreti', 'maria@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0812-3456-7004', 'Perempuan', '1967-09-25', 'Katolik', 'Jl. Anggrek No. 8, Yogyakarta', NULL, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(5, 'Hendra Wijaya', 'hendra@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0812-3456-7005', 'Laki-laki', '1975-12-03', 'Kristen', 'Jl. Flamboyan No. 12, Medan', NULL, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(6, 'Arham Abdulah Nuhsin', 'aan@gmail.com', '$2y$10$LQT7ttcGvxFKxf7XqVLYZeIlQo9y42PriS7oW.PD82hAgei4BF7zi', '085246788907', 'Laki-laki', '2007-10-20', 'Islam', 'Dusun Garangga, Desa Lanto, Kecamatan Mawasangka Tengah, Kabupaten Buton Tengah, Provinsi Sulawesi Tenggara', NULL, '2026-07-02 09:29:26', '2026-07-02 09:29:26');

-- --------------------------------------------------------

--
-- Table structure for table `perawat`
--

CREATE TABLE `perawat` (
  `id` int(10) UNSIGNED NOT NULL,
  `nama` varchar(150) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `spesialis` varchar(100) DEFAULT 'Spesialis Hipertensi',
  `pengalaman` varchar(50) DEFAULT NULL,
  `jenis_kelamin` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `is_online` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `perawat`
--

INSERT INTO `perawat` (`id`, `nama`, `email`, `password`, `spesialis`, `pengalaman`, `jenis_kelamin`, `tanggal_lahir`, `alamat`, `foto`, `is_online`, `created_at`, `updated_at`) VALUES
(1, 'Ns. Siti Aisyah, S.Kep', 'perawat@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Spesialis Hipertensi', '5 Tahun Pengalaman', 'Perempuan', '1990-05-12', NULL, NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(2, 'Ns. Rina Amelia, S.Kep', 'rina@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Spesialis Hipertensi', '4 Tahun Pengalaman', 'Perempuan', '1992-09-08', NULL, NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(3, 'Ns. Andi Pratama, S.Kep', 'andi@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Spesialis Hipertensi', '3 Tahun Pengalaman', 'Laki-laki', '1994-11-30', NULL, NULL, 0, '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(4, 'Ns. Dewi Lestari, S.Kep', 'dewi@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Spesialis Kardiovaskular', '6 Tahun Pengalaman', 'Perempuan', '1988-02-14', NULL, NULL, 1, '2026-07-01 08:40:23', '2026-07-01 08:40:23');

-- --------------------------------------------------------

--
-- Table structure for table `remember_tokens`
--

CREATE TABLE `remember_tokens` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `role` enum('pasien','perawat') NOT NULL,
  `token` varchar(64) NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `riwayat_kesehatan`
--

CREATE TABLE `riwayat_kesehatan` (
  `id` int(10) UNSIGNED NOT NULL,
  `pasien_id` int(10) UNSIGNED NOT NULL,
  `judul` varchar(200) NOT NULL,
  `deskripsi` text DEFAULT NULL,
  `tanggal` date NOT NULL,
  `jenis` enum('penyakit','alergi','operasi','obat','lainnya') DEFAULT 'lainnya',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `riwayat_kesehatan`
--

INSERT INTO `riwayat_kesehatan` (`id`, `pasien_id`, `judul`, `deskripsi`, `tanggal`, `jenis`, `created_at`, `updated_at`) VALUES
(1, 1, 'Diabetes Tipe 2', 'Terdiagnosis diabetes tipe 2 sejak tahun 2018, rutin kontrol gula darah', '2018-03-10', 'penyakit', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(2, 1, 'Alergi Penisilin', 'Reaksi alergi parah terhadap antibiotik penisilin', '2015-07-20', 'alergi', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(3, 1, 'Appendektomi', 'Operasi pengangkatan usus buntu di RS Umum Jakarta', '2010-11-05', 'operasi', '2026-07-01 08:40:23', '2026-07-01 08:40:23');

-- --------------------------------------------------------

--
-- Table structure for table `tekanan_darah`
--

CREATE TABLE `tekanan_darah` (
  `id` int(10) UNSIGNED NOT NULL,
  `pasien_id` int(10) UNSIGNED NOT NULL,
  `perawat_id` int(10) UNSIGNED DEFAULT NULL,
  `tanggal` date NOT NULL,
  `sistolik` smallint(6) NOT NULL,
  `diastolik` smallint(6) NOT NULL,
  `denyut_nadi` smallint(6) DEFAULT NULL,
  `berat_badan` decimal(5,2) DEFAULT NULL,
  `catatan` text DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tekanan_darah`
--

INSERT INTO `tekanan_darah` (`id`, `pasien_id`, `perawat_id`, `tanggal`, `sistolik`, `diastolik`, `denyut_nadi`, `berat_badan`, `catatan`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, '2025-05-01', 120, 80, 72, 68.50, 'Setelah istirahat pagi', 'Normal', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(2, 1, NULL, '2025-05-07', 128, 84, 76, 69.00, 'Setelah makan pagi', 'Normal', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(3, 1, NULL, '2025-05-14', 118, 78, 70, 68.80, 'Sebelum aktivitas', 'Normal', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(4, 1, NULL, '2025-05-21', 125, 82, 74, 69.20, 'Setelah olahraga ringan', 'Normal', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(5, 1, NULL, '2025-05-29', 130, 85, 78, 69.50, 'Agak stres kerja', 'Pra Hipertensi', '2026-07-01 08:40:23', '2026-07-01 08:40:23'),
(6, 1, NULL, '2025-06-04', 120, 80, 72, 69.00, 'Kondisi rileks', 'Normal', '2026-07-01 08:40:23', '2026-07-01 08:40:23');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activity` (`user_id`,`role`,`created_at`);

--
-- Indexes for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pasien_time` (`pasien_id`,`created_at`),
  ADD KEY `idx_pasien_role` (`pasien_id`,`role`);

--
-- Indexes for table `chat_perawat`
--
ALTER TABLE `chat_perawat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasien_id` (`pasien_id`),
  ADD KEY `perawat_id` (`perawat_id`);

--
-- Indexes for table `edukasi`
--
ALTER TABLE `edukasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_kategori` (`kategori`),
  ADD KEY `idx_published` (`is_published`);

--
-- Indexes for table `konsultasi`
--
ALTER TABLE `konsultasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasien_id` (`pasien_id`),
  ADD KEY `perawat_id` (`perawat_id`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_login` (`user_id`,`role`,`created_at`);

--
-- Indexes for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_notif` (`user_id`,`role`),
  ADD KEY `idx_user_dibaca` (`user_id`,`role`,`dibaca`);

--
-- Indexes for table `pasien`
--
ALTER TABLE `pasien`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `perawat`
--
ALTER TABLE `perawat`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`),
  ADD KEY `idx_token` (`token`),
  ADD KEY `idx_user` (`user_id`,`role`);

--
-- Indexes for table `riwayat_kesehatan`
--
ALTER TABLE `riwayat_kesehatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pasien_id` (`pasien_id`);

--
-- Indexes for table `tekanan_darah`
--
ALTER TABLE `tekanan_darah`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pasien_tanggal` (`pasien_id`,`tanggal`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chat_perawat`
--
ALTER TABLE `chat_perawat`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `edukasi`
--
ALTER TABLE `edukasi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `konsultasi`
--
ALTER TABLE `konsultasi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `pasien`
--
ALTER TABLE `pasien`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `perawat`
--
ALTER TABLE `perawat`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `remember_tokens`
--
ALTER TABLE `remember_tokens`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `riwayat_kesehatan`
--
ALTER TABLE `riwayat_kesehatan`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tekanan_darah`
--
ALTER TABLE `tekanan_darah`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ai_conversations`
--
ALTER TABLE `ai_conversations`
  ADD CONSTRAINT `ai_conversations_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_perawat`
--
ALTER TABLE `chat_perawat`
  ADD CONSTRAINT `chat_perawat_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_perawat_ibfk_2` FOREIGN KEY (`perawat_id`) REFERENCES `perawat` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `konsultasi`
--
ALTER TABLE `konsultasi`
  ADD CONSTRAINT `konsultasi_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `konsultasi_ibfk_2` FOREIGN KEY (`perawat_id`) REFERENCES `perawat` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `riwayat_kesehatan`
--
ALTER TABLE `riwayat_kesehatan`
  ADD CONSTRAINT `riwayat_kesehatan_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tekanan_darah`
--
ALTER TABLE `tekanan_darah`
  ADD CONSTRAINT `tekanan_darah_ibfk_1` FOREIGN KEY (`pasien_id`) REFERENCES `pasien` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
