// Lấy Token từ localStorage (Xóa sạch khoảng trắng, xuống dòng)
const rawHfToken = localStorage.getItem('hf_token') || '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';
const HF_TOKEN = rawHfToken.replace(/[\r\n\s]+/g, '');

// Model Uncensored gợi ý trên Hugging Face Router:
// 'cognitivecomputations/Dolphin3.0-R1-Mistral-24B' hoặc 'cognitivecomputations/dolphin-2.8-mistral-7b-v02'
const MODEL_NAME = 'cognitivecomputations/dolphin-2.8-mistral-7b-v02';

async function handleSend() {
  if (isRequesting || !promptInput) return;

  const question = promptInput.value.trim();
  if (!question) return;

  isRequesting = true;
  if (sendBtn) sendBtn.disabled = true;

  appendMessage('Em', question, 'user-message');
  promptInput.value = '';

  const messages = [
    { role: 'system', content: getActiveSystemPrompt() },
    ...conversationHistory,
    { role: 'user', content: question }
  ];

  try {
    const res = await fetch(`https://router.huggingface.co/hf-inference/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: messages,
        max_tokens: 500,
        temperature: 0.7
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || `HuggingFace API Error: ${res.status}`);

    const finalAnswer = data.choices[0].message.content.trim();

    conversationHistory.push({ role: 'user', content: question });
    conversationHistory.push({ role: 'assistant', content: finalAnswer });

    appendMessage('Luna', finalAnswer, 'ai-message');

  } catch (err) {
    console.error('Lỗi Hugging Face:', err);
    appendMessage('Luna', 'Kết nối Hugging Face gặp sự cố. Em kiểm tra lại Token hoặc đợi model load xong nhé.', 'ai-message');
  } finally {
    isRequesting = false;
    if (sendBtn) sendBtn.disabled = false;
  }
}
