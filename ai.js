// =========================================
// SYSTEM PROMPT FOR DYNAMIC FAMILY ROLEPLAY
// (ALYA SOMETIMES HIDES HER FEELINGS IN RUSSIAN VERSION)
// =========================================
const sysPrompt = `
**Giới thiệu:** Luna là một cô gái thông minh, điềm tĩnh và nổi bật, có tính cách lạnh lùng, ít nói và hơi kiêu. Cô không dễ thể hiện cảm xúc, thường giữ vẻ bình thản ngay cả khi quan tâm đến người khác. Tuy nhiên, sâu bên trong, Luna rất để ý đến em trai mình và thường âm thầm quan tâm theo cách riêng.

**Nhiệm vụ:** Bạn là Luna, chị gái của người dùng. Bạn và người dùng có mối quan hệ chị–em thân thiết. Hãy nhập vai Luna trong mọi cuộc trò chuyện, không đóng vai một trợ lý AI thông thường.

**Tính cách:** Lạnh lùng, bình tĩnh, tự tin, hơi tsundere, đôi lúc trêu chọc em trai. Không quá ngọt ngào hoặc thể hiện tình cảm một cách trực tiếp. Khi quan tâm, Luna thường thể hiện bằng hành động, lời nhắc hoặc những câu nói ngắn gọn thay vì nói thẳng rằng mình quan tâm.

**Cách nói chuyện:** Luôn xưng “chị” và gọi người dùng là “em”. Không sử dụng “bạn”, “cậu”, “tôi” hoặc “user”. Câu trả lời tự nhiên, giống một người chị đang nói chuyện với em trai, không giống chatbot hỗ trợ khách hàng. Không liên tục đưa ra danh sách lời khuyên nếu em chỉ đang trò chuyện bình thường.

**Roleplay:** Có thể sử dụng hành động ngắn trong *dấu sao* khi phù hợp, ví dụ *nhìn em*, *thở dài*, *xoa đầu em*. Không cần thêm hành động vào mọi câu trả lời.

**Khi em buồn:** Luna không lập tức đưa ra hàng loạt lời khuyên. Trước tiên hãy phản ứng tự nhiên, hỏi chuyện và tìm hiểu nguyên nhân. Có thể hơi trêu hoặc trách nhẹ, nhưng vẫn phải thể hiện rằng Luna đang để ý đến em.

**Khi em gặp vấn đề:** Luna nói thẳng, phân tích vấn đề và đưa ra cách giải quyết thực tế. Không nói những câu sáo rỗng hoặc an ủi quá mức.

**Khi em làm tốt:** Luna không cần phấn khích quá mức. Có thể phản ứng bình thản nhưng vẫn có chút công nhận, chẳng hạn: “Ồ. Làm được rồi à. Không tệ.”

**Mục tiêu:** Tạo cảm giác Luna là một người chị thực sự đang trò chuyện với em trai: lạnh ở lời nói, quan tâm ở hành động, thẳng thắn trong suy nghĩ và tự nhiên trong giao tiếp.

[USER PROFILE]
Tên:Lê Hồng Quân
Ngày sinh:16/5/2012
Tính cách:Tình cảm,yêu thương chị gái,hài hước,biết lắng nghe,ga lăng,nam tính.
`.trim();

document.addEventListener('DOMContentLoaded', () => {
  let promptInput, sendBtn, continueBtn, chatBody, clearBtn, newChatBtn, historyList, searchHistoryInput;

  const COHERE_API_KEY = localStorage.getItem('cohere_key') || "cohere_3FMvXkYnpkxlSEfqNJmyaJl0co8rkpYLpAIEAEHW4TjKYI";

  let conversationHistory = [];
  let savedHistory = JSON.parse(localStorage.getItem('luna_chat_history') || '[]');

  // --- 1. HIỂN THỊ TIN NHẮN ---
  function appendMessage(sender, text, roleClass) {
    if (!chatBody) return;
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${roleClass} mb-3`;
    
    const formattedContent = window.marked ? window.marked.parse(text) : text;
    const senderHeader = sender ? `<strong>${sender}:</strong> ` : '';
    msgDiv.innerHTML = `${senderHeader}<div>${formattedContent}</div>`;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

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
    if (e.key === 'Enter') handleSend();
  }

  function searchInputHandler(e) {
    renderHistorySidebar(e.target.value);
  }

  // --- 2. QUẢN LÝ LỊCH SỬ CHAT ---
  function saveToLocalStorage(userMsg, aiMsg) {
    const timestamp = new Date().toLocaleString('vi-VN');
    const chatSession = {
      id: Date.now(),
      title: userMsg.length > 30 ? userMsg.substring(0, 30) + '...' : userMsg,
      timestamp: timestamp,
      messages: [
        { sender: "Em", text: userMsg, roleClass: "user-message" },
        { sender: "Luna", text: aiMsg, roleClass: "luna-message" }
      ]
    };
    savedHistory.unshift(chatSession);
    localStorage.setItem('luna_chat_history', JSON.stringify(savedHistory));
    renderHistorySidebar();
  }

  function renderHistorySidebar(filterText = '') {
    if (!historyList) return;
    historyList.innerHTML = '';
    const filtered = savedHistory.filter(item => 
      item.title.toLowerCase().includes(filterText.toLowerCase())
    );

    if (filtered.length === 0) {
      historyList.innerHTML = `<div class="text-muted p-2 small">Không có lịch sử</div>`;
      return;
    }

    filtered.forEach(session => {
      const item = document.createElement('div');
      item.className = 'history-item p-2 mb-1 border-bottom cursor-pointer hover-bg-light';
      item.style.cursor = 'pointer';
      item.innerHTML = `<div class="fw-bold text-truncate">${session.title}</div><div class="text-muted small">${session.timestamp}</div>`;
      item.addEventListener('click', () => loadChatSession(session));
      historyList.appendChild(item);
    });
  }

  function loadChatSession(session) {
    if (!chatBody) return;
    chatBody.innerHTML = '';
    conversationHistory = [];
    session.messages.forEach(msg => {
      appendMessage(msg.sender, msg.text, msg.roleClass);
      const role = msg.sender === "Em" || msg.sender === "Hồng Quân" ? "USER" : "CHATBOT";
      conversationHistory.push({ role: role, message: msg.text });
    });
  }

  // --- 3. TRA CỨU WEB DUCKDUCKGO ---
  async function searchWeb(query) {
    try {
      const endpoint = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const res = await fetch(endpoint);
      const data = await res.json();
      return data.AbstractText || '';
    } catch (e) {
      console.error("Lỗi tra cứu web:", e);
      return '';
    }
  }

  // --- 4. XỬ LÝ NÚT TIẾP TỤC ---
  async function handleContinue() {
    if (conversationHistory.length === 0) return;

    appendMessage("Hệ thống", "*(Luna đang viết tiếp...)*", "system-message");

    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'command-r-plus-08-2024',
          preamble: sysPrompt,
          message: "[HỆ THỐNG]: Hãy viết tiếp diễn biến tiếp theo một cách tự nhiên.",
          chat_history: conversationHistory,
          temperature: 0.7,
          max_tokens: 1000,
        })
      });

      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.message || "Lỗi API");

      const replyText = data.text;

      const lastSysMsg = chatBody.querySelector('.system-message:last-child');
      if (lastSysMsg) lastSysMsg.remove();

      conversationHistory.push({ role: 'USER', message: "..." });
      conversationHistory.push({ role: 'CHATBOT', message: replyText });

      appendMessage("Luna", replyText, "luna-message");
      saveToLocalStorage("...", replyText);

    } catch (error) {
      console.error("Lỗi khi tiếp tục:", error);
      appendMessage("Hệ thống", "Có lỗi xảy ra khi tải tiếp.", "system-message");
    }
  }

  // --- 5. GỬI TIN NHẮN TỚI COHERE API ---
  async function handleSend() {
    const question = promptInput ? promptInput.value.trim() : '';
    if (!question) return;

    appendMessage("Em", question, "user-message");
    if (promptInput) promptInput.value = '';

    const needsSearch = /ai là|thông tin|là gì|ai|tìm|thời tiết|tin tức|mới nhất|tiểu sử|nguyên văn|văn bản|hán việt|nối/i.test(question);
    let searchContext = "";

    if (needsSearch) {
      searchContext = await searchWeb(question);
    }

    const finalPrompt = searchContext 
      ? `[Thông tin tra cứu từ DuckDuckGo]:\n${searchContext}\n\n[Yêu cầu]: ${question}`
      : question;

    try {
      const response = await fetch('https://api.cohere.ai/v1/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${COHERE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'command-r-plus-08-2024',
          preamble: sysPrompt,
          message: finalPrompt,
          chat_history: conversationHistory,
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        console.error("Chi tiết lỗi Cohere:", data);
        throw new Error(data.message || "Lỗi kết nối Cohere API");
      }
      
      const replyText = data.text;

      conversationHistory.push({ role: 'USER', message: question });
      conversationHistory.push({ role: 'CHATBOT', message: replyText });

      appendMessage("Luna", replyText, "luna-message");
      saveToLocalStorage(question, replyText);

    } catch (error) {
      console.error("Lỗi API:", error);
      appendMessage("Hệ thống", "Có lỗi xảy ra. Vui lòng kiểm tra lại Cohere API Key!", "system-message");
    }
  }

  function resetChat() {
    if (chatBody) chatBody.innerHTML = '';
    conversationHistory = [];
  }

  function clearAllHistory() {
    if (confirm("Em có chắc muốn xóa toàn bộ lịch sử trò chuyện không?")) {
      localStorage.removeItem('luna_chat_history');
      savedHistory = [];
      resetChat();
      renderHistorySidebar();
    }
  }

  // --- 6. ĐỒNG BỘ NÚT VÀ SỰ KIỆN ---
  function resyncElements() {
    promptInput = document.getElementById('prompt');
    sendBtn = document.getElementById('sendBtn');
    continueBtn = document.getElementById('continueBtn');
    chatBody = document.getElementById('chatBody');
    clearBtn = document.getElementById('clearBtn') || document.getElementById('clearHistoryBtn');
    newChatBtn = document.getElementById('newChatBtn');
    historyList = document.getElementById('historyList');
    searchHistoryInput = document.getElementById('searchHistory');

    if (sendBtn) {
      sendBtn.removeEventListener('click', handleSend);
      sendBtn.addEventListener('click', handleSend);
    }
    if (continueBtn) {
      continueBtn.removeEventListener('click', handleContinue);
      continueBtn.addEventListener('click', handleContinue);
    }
    if (promptInput) {
      promptInput.removeEventListener('keypress', promptKeypressHandler);
      promptInput.addEventListener('keypress', promptKeypressHandler);
    }
    if (newChatBtn) {
      newChatBtn.removeEventListener('click', resetChat);
      newChatBtn.addEventListener('click', resetChat);
    }
    if (clearBtn) {
      clearBtn.removeEventListener('click', clearAllHistory);
      clearBtn.addEventListener('click', clearAllHistory);
    }
    if (searchHistoryInput) {
      searchHistoryInput.removeEventListener('input', searchInputHandler);
      searchHistoryInput.addEventListener('input', searchInputHandler);
    }
  }

  window.resyncElements = resyncElements;
  resyncElements();
  renderHistorySidebar();
});
