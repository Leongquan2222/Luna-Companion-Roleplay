document.addEventListener('DOMContentLoaded', () => {
  let promptInput, sendBtn, chatBody, newChatBtn;

  // Lấy HF Token từ localStorage và làm sạch ký tự ngắt dòng/khoảng trắng
  function getCleanHfToken() {
    const rawToken = localStorage.getItem('hf_token') || '';
    return rawToken.replace(/[\r\n\s]+/g, '');
  }

  // Model Uncensored mặc định trên Hugging Face Router
  const MODEL_NAME = 'orcarouter/Qwen3.8-27B-Uncensored-FP8';

  let conversationHistory = [];
  let pastedImage = null;
  let isRequesting = false; // Chống spam request

  function getActiveSystemPrompt() {
    return typeof sysPrompt !== 'undefined' ? sysPrompt : 'Bạn là Luna, một trợ lý AI cá nhân tự do, thông minh và hữu ích.';
  }

  function appendMessage(sender, text, roleClass) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div');
    const isUser = roleClass === 'user-message';

    msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;
    const formattedContent = window.marked ? window.marked.parse(text) : text;
    const avatarIcon = isUser ? '<i class="bi bi-person-fill"></i>' : '<i class="bi bi-moon-stars-fill"></i>';

    msgDiv.innerHTML = `
      <div class="avatar">${avatarIcon}</div>
      <div class="bubble">${formattedContent}</div>
    `;

    chatBody.appendChild(msgDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: 'smooth' });

    setTimeout(() => {
      if (window.renderMathInElement) {
        window.renderMathInElement(msgDiv, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }, 0);
  }

  function promptKeypressHandler(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          pastedImage = file;
          appendMessage('Hệ thống', '📎 Đã đính kèm 1 ảnh từ clipboard.', 'user-message');
        }
        e.preventDefault();
        break;
      }
    }
  }

  async function handleSend() {
    if (isRequesting || !promptInput) return;

    const token = getCleanHfToken();
    if (!token) {
      appendMessage('Luna', 'Chưa tìm thấy Hugging Face Token. Bạn hãy mở Console (F12) và nhập: `localStorage.setItem("hf_token", "hf_x...")` nhé.', 'ai-message');
      return;
    }

    const question = promptInput.value.trim();
    if (!question && !pastedImage) return;

    isRequesting = true;
    if (sendBtn) sendBtn.disabled = true;

    if (question) appendMessage('Em', question, 'user-message');
    if (pastedImage) {
      appendMessage('Em', '🖼️ [Đã gửi ảnh]', 'user-message');
      pastedImage = null;
    }

    promptInput.value = '';

    const messages = [
      { role: 'system', content: getActiveSystemPrompt() },
      ...conversationHistory,
      { role: 'user', content: question }
    ];

    try {
      const res = await fetch('https://router.huggingface.co/hf-inference/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Lỗi Hugging Face HTTP ${res.status}`);
      }

      const finalAnswer = data.choices[0].message.content.trim();

      conversationHistory.push({ role: 'user', content: question });
      conversationHistory.push({ role: 'assistant', content: finalAnswer });

      appendMessage('Luna', finalAnswer, 'ai-message');

    } catch (err) {
      console.error('Lỗi Hugging Face API:', err);
      appendMessage('Luna', 'Không thể kết nối tới Hugging Face. Bạn kiểm tra lại Token hoặc đợi vài giây để model khởi động nhé.', 'ai-message');
    } finally {
      isRequesting = false;
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  function resetChat() {
    if (chatBody) {
      chatBody.innerHTML = `
        <div class="message ai">
          <div class="avatar"><i class="bi bi-moon-stars-fill"></i></div>
          <div class="bubble">
            Chào bạn. Tôi là Luna. Tôi có thể hỗ trợ gì cho bạn hôm nay?
          </div>
        </div>
      `;
    }
    conversationHistory = [];
    pastedImage = null;
  }

  function resyncElements() {
    promptInput = document.getElementById('prompt');
    sendBtn = document.getElementById('sendBtn');
    chatBody = document.getElementById('chatBody');
    newChatBtn = document.getElementById('newChatBtn');

    if (sendBtn) {
      sendBtn.removeEventListener('click', handleSend);
      sendBtn.addEventListener('click', handleSend);
    }
    if (promptInput) {
      promptInput.removeEventListener('keydown', promptKeypressHandler);
      promptInput.addEventListener('keydown', promptKeypressHandler);
      promptInput.removeEventListener('paste', handlePaste);
      promptInput.addEventListener('paste', handlePaste);
    }
    if (newChatBtn) {
      newChatBtn.removeEventListener('click', resetChat);
      newChatBtn.addEventListener('click', resetChat);
    }
  }

  window.resyncElements = resyncElements;
  resyncElements();
});
