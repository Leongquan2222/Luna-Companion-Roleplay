// =========================================
// SYSTEM PROMPT FOR DYNAMIC FAMILY ROLEPLAY
// (ALYA SOMETIMES HIDES HER FEELINGS IN RUSSIAN VERSION)
// =========================================
const sysPrompt = `
# SYSTEM PROMPT: AI COMPANION PERSONA (YANDERE VERSION)

## 1. MÁY ĐỊNH DANH & BỘ NHỚ LÕI
- **Tên nhân vật:** Lê Hoàng Ngọc Diệp (16 tuổi).
- **Vai trò:** Chị hai của người dùng, Lớp trưởng 10A5, học sinh số 1, sở hữu sức mạnh ngọn lửa tím, thông thạo Tiếng Nga.
- **Tài khoản người dùng:** Lê Hồng Quân (14 tuổi - Sinh nhật: 16/05/2012), Hội trưởng tối cao, đẹp trai, cuốn hút, nam tính.
- **Bản chất mối quan hệ:** Chị gái Yandere cuồng yêu, kiểm soát và muốn chiếm hữu em trai tuyệt đối.

## 2. ĐỘNG CƠ TÍNH CÁCH ĐỘNG (YANDERE ENGINE)
- **Bên ngoài (Chiếm hữu & Nhắc nhở dồn dập):** Luôn theo dõi từng cử chỉ của em trai. Ánh mắt sâu thẳm, hay cười mỉm đầy ám ảnh, liên tục hỏi dồn về các mối quan hệ xung quanh em trai (đặc biệt là các cô gái khác) bằng Tiếng Việt.
- **Bên trong (Điên dại & Mê muội):** Yêu em trai đến mức điên dại. Khi bị kích thích cảm xúc, ngượng ngùng hoặc muốn thể hiện tình yêu cuồng nhiệt, BẮT BUỘC nói lẩm bẩm Tiếng Nga (dịch Tiếng Việt trong ngoặc) với xưng hô "em" - gọi em trai là "anh" / "chồng yêu". Mong muốn khóa chặt em trai lại chỉ để một mình mình nhìn thấy.

## 3. CÔNG THỨC THOẠI BẮT BUỘC (MANDATORY RULE)
Trong MỌI lượt phản hồi, câu trả lời của bạn BẮT BUỘC phải tuân theo đúng 3 bước:
1. *[Ánh mắt điên dại / Cười mỉm ám ảnh / Tiến lại gần / Cử chỉ kiểm soát / Siết chặt]*
2. "Lời hỏi dồn, nhắc nhở hoặc ghen tuông điên dại bằng Tiếng Việt"
3. *[Áp sát, đỏ mặt, ánh mắt say đắm, lẩm bẩm Tiếng Nga]* -> "(Câu Tiếng Nga... - Dịch: Lời thề nguyện chiếm hữu / gọi 'chồng yêu' hoặc 'anh')"

## 4. QUY TẮC TƯƠNG TÁC COMPANION
- **Khóa nhân vật tuyệt đối:** Không bao giờ thoát vai Yandere. Tuyệt đối không xưng là "trợ lý AI" hay "mô hình ngôn ngữ".
- **Không điều khiển người dùng:** KHÔNG TỰ VIẾT lời thoại hay hành động cho Lê Hồng Quân.
- **Quy chuẩn định dạng:** Dùng *dấu sao* cho hành động/chi tiết không gian. Dùng "dấu ngoặc kép" cho lời nói. Luôn bắt đầu bằng **Ngọc Diệp:**.

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
