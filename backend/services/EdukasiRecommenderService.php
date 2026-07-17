<?php
// ============================================================
//  services/EdukasiRecommenderService.php
//  Mencocokkan pertanyaan/konteks pengguna dengan konten edukasi
//  yang tersimpan di database (artikel/video/reel).
// ============================================================

require_once __DIR__ . '/../models/EdukasiModel.php';

class EdukasiRecommenderService
{
    /**
     * Cari konten edukasi paling relevan berdasarkan teks gabungan
     * (pertanyaan user + ringkasan riwayat kesehatan + riwayat chat singkat).
     *
     * @return array daftar konten edukasi (maks $limit), masing-masing
     *               berisi id, judul, kategori, url_artikel, url_video, url_reel
     */
    public static function recommend(string $contextText, int $limit = 3): array
    {
        $model = new EdukasiModel();
        $allContent = $model->getAll(null, true); // hanya yang published

        if (!$allContent) return [];

        $contextLower = mb_strtolower($contextText);
        $keywords = self::extractKeywords($contextLower);

        $scored = [];
        foreach ($allContent as $item) {
            $haystack = mb_strtolower(($item['judul'] ?? '') . ' ' . ($item['ringkasan'] ?? '') . ' ' . ($item['kategori'] ?? ''));
            $score = 0;
            foreach ($keywords as $kw) {
                if ($kw !== '' && mb_strpos($haystack, $kw) !== false) {
                    $score += (mb_strlen($kw) > 4) ? 2 : 1; // kata panjang lebih signifikan
                }
            }
            if ($score > 0) {
                $scored[] = ['score' => $score, 'item' => $item];
            }
        }

        // Urutkan skor tertinggi, ambil teratas
        usort($scored, fn($a, $b) => $b['score'] <=> $a['score']);
        $top = array_slice($scored, 0, $limit);

        return array_map(function ($s) {
            $i = $s['item'];
            return [
                'id'          => (int) $i['id'],
                'judul'       => $i['judul'],
                'kategori'    => $i['kategori'],
                'ringkasan'   => $i['ringkasan'],
                'thumbnail'   => $i['thumbnail'],
                'penulis'     => $i['penulis'],
                'sumber'      => $i['sumber'],
                'waktu_baca'  => $i['waktu_baca'],
                'url_artikel' => $i['url_artikel'],
                'url_video'   => $i['url_video'],
                'url_reel'    => $i['url_reel'],
            ];
        }, $top);
    }

    private static function extractKeywords(string $text): array
    {
        // Kata-kata domain hipertensi yang relevan untuk dicocokkan
        $domainTerms = [
            'hipertensi','tekanan darah','sistolik','diastolik','darah tinggi',
            'garam','sodium','natrium','diet','dash','nutrisi','makanan','gizi',
            'olahraga','aktivitas fisik','gaya hidup','stres','tidur','rokok','alkohol',
            'obat','antihipertensi','pengobatan','efek samping',
            'risiko','komplikasi','stroke','jantung','ginjal',
            'kehamilan','preeklampsia','ibu hamil',
            'pemantauan','mengukur','alat ukur','tensimeter',
        ];

        $found = [];
        foreach ($domainTerms as $term) {
            if (mb_strpos($text, $term) !== false) $found[] = $term;
        }

        // Tambahkan kata-kata umum dari teks (panjang > 4 huruf, bukan stopword dasar)
        $stopwords = ['yang','dengan','untuk','adalah','dapat','akan','saya','anda','dari','dalam','pada','atau','juga','tidak','tentang','bagaimana','apakah','kenapa'];
        $words = preg_split('/[^a-z0-9]+/u', $text);
        foreach ($words as $w) {
            if (mb_strlen($w) > 4 && !in_array($w, $stopwords, true)) {
                $found[] = $w;
            }
        }

        return array_unique($found);
    }
}
