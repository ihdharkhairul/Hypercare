<?php
// ============================================================
//  services/OpenAiService.php
//  Wrapper komunikasi ke OpenAI Chat Completions API.
//  Frontend TIDAK PERNAH menyentuh file ini secara langsung —
//  hanya diakses melalui AiChatController di server.
// ============================================================

require_once __DIR__ . '/../config/app.php';

class OpenAiService
{
    /**
     * Kirim percakapan ke OpenAI dan kembalikan teks balasan.
     *
     * @param array $messages  Format OpenAI: [{role, content}, ...]
     * @throws RuntimeException jika request gagal
     */
    public static function chat(array $messages, int $maxRetry = 2): string
    {
        $apiKey = OPENAI_API_KEY;
        if (!$apiKey || str_starts_with($apiKey, 'sk-REPLACE')) {
            throw new RuntimeException('OPENAI_API_KEY belum dikonfigurasi di server.');
        }

        $payload = json_encode([
            'model'       => OPENAI_MODEL,
            'messages'    => $messages,
            'temperature' => 0.6,
            'max_tokens'  => 600,
        ]);

        $lastError = null;

        for ($attempt = 1; $attempt <= $maxRetry; $attempt++) {
            $ch = curl_init(OPENAI_API_URL);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST           => true,
                CURLOPT_POSTFIELDS     => $payload,
                CURLOPT_HTTPHEADER     => [
                    'Content-Type: application/json',
                    'Authorization: Bearer ' . $apiKey,
                ],
                CURLOPT_TIMEOUT        => AI_REQUEST_TIMEOUT,
                CURLOPT_CONNECTTIMEOUT => 10,
            ]);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $curlErr  = curl_error($ch);
            curl_close($ch);

            if ($curlErr) {
                $lastError = "Koneksi ke OpenAI gagal: $curlErr";
                usleep(400000);
                continue;
            }

            $data = json_decode($response, true);

            if ($httpCode === 200 && isset($data['choices'][0]['message']['content'])) {
                return trim($data['choices'][0]['message']['content']);
            }

            if (in_array($httpCode, [429, 500, 502, 503], true)) {
                $lastError = $data['error']['message'] ?? "OpenAI mengembalikan status $httpCode";
                usleep(600000 * $attempt);
                continue;
            }

            $lastError = $data['error']['message'] ?? "OpenAI mengembalikan status $httpCode";
            break;
        }

        throw new RuntimeException($lastError ?? 'Gagal menghubungi OpenAI API.');
    }
}
