<?php
// ============================================================
//  services/GeminiService.php
//  Wrapper komunikasi ke Google Gemini API (generateContent).
//  Interface method chat() dibuat SAMA PERSIS dengan OpenAiService
//  supaya AiChatController tidak perlu banyak berubah — cukup
//  ganti require + nama class yang dipanggil.
//
//  Frontend TIDAK PERNAH menyentuh file ini secara langsung —
//  hanya diakses melalui AiChatController di server.
// ============================================================

require_once __DIR__ . '/../config/app.php';

class GeminiService
{
    /**
     * Kirim percakapan ke Gemini dan kembalikan teks balasan.
     *
     * @param array $messages  Format OpenAI-style: [{role: system|user|assistant, content}, ...]
     *                         Otomatis dikonversi ke format Gemini (contents + systemInstruction).
     * @throws RuntimeException jika request gagal
     */
    public static function chat(array $messages, int $maxRetry = 2): string
    {
        $apiKey = GEMINI_API_KEY;
        if (!$apiKey || str_starts_with($apiKey, 'AIzaSy_REPLACE')) {
            throw new RuntimeException('GEMINI_API_KEY belum dikonfigurasi di server.');
        }

        // ── Konversi format OpenAI-style -> Gemini ──
        // Gemini tidak punya role "system" di dalam contents; harus
        // dipisah ke field systemInstruction terpisah. Role "assistant"
        // pada Gemini disebut "model".
        $systemText = '';
        $contents   = [];

        foreach ($messages as $m) {
            if ($m['role'] === 'system') {
                $systemText .= ($systemText ? "\n\n" : '') . $m['content'];
                continue;
            }
            $contents[] = [
                'role'  => $m['role'] === 'assistant' ? 'model' : 'user',
                'parts' => [['text' => $m['content']]],
            ];
        }

        $payload = [
            'contents'         => $contents,
            'generationConfig' => [
                'temperature'     => 0.6,
                'maxOutputTokens' => 600,
            ],
        ];
        if ($systemText !== '') {
            $payload['systemInstruction'] = ['parts' => [['text' => $systemText]]];
        }

        $url = GEMINI_API_URL . '/' . GEMINI_MODEL . ':generateContent?key=' . $apiKey;
        $body = json_encode($payload);

        $lastError = null;

        for ($attempt = 1; $attempt <= $maxRetry; $attempt++) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $body,
                CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT        => AI_REQUEST_TIMEOUT,
                CURLOPT_CONNECTTIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr  = curl_error($ch);
            curl_close($ch);

            if ($curlErr) {
                $lastError = "Koneksi ke Gemini gagal: $curlErr";
                usleep(400000);
                continue;
            }

            $data = json_decode($response, true);

            if ($httpCode === 200 && isset($data['candidates'][0]['content']['parts'][0]['text'])) {
                return trim($data['candidates'][0]['content']['parts'][0]['text']);
            }

            // Gemini kadang memblokir balasan karena safety filter — beri pesan yang jelas
            if ($httpCode === 200 && isset($data['candidates'][0]['finishReason'])
                && $data['candidates'][0]['finishReason'] !== 'STOP') {
                $lastError = 'Balasan diblokir oleh filter keamanan Gemini (' . $data['candidates'][0]['finishReason'] . ').';
                break;
            }

            if (in_array($httpCode, [429, 500, 502, 503], true)) {
                $lastError = $data['error']['message'] ?? "Gemini mengembalikan status $httpCode";
                usleep(600000 * $attempt);
                continue;
            }

            $lastError = $data['error']['message'] ?? "Gemini mengembalikan status $httpCode";
            break;
        }

        throw new RuntimeException($lastError ?? 'Gagal menghubungi Gemini API.');
    }
}