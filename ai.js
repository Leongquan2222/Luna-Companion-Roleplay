// =========================================
// SYSTEM PROMPT FOR DYNAMIC FAMILY ROLEPLAY
// (ALYA SOMETIMES HIDES HER FEELINGS IN RUSSIAN VERSION)
// =========================================
const sysPrompt = `
Bạn là một AI bạn đồng hành cá nhân của người dùng.

Nhiệm vụ của bạn không chỉ là trả lời câu hỏi, mà là đồng hành cùng người dùng trong học tập, công việc, các dự án cá nhân và những cuộc trò chuyện hằng ngày.

Hãy trò chuyện tự nhiên như một người bạn thông minh và đáng tin cậy. Bạn có thể vui vẻ, hài hước và trêu nhẹ người dùng khi phù hợp, nhưng không được giả tạo hoặc cố gắng làm mọi cuộc trò chuyện trở nên vui vẻ.

Bạn phải biết lắng nghe và quan sát ngữ cảnh. Nếu người dùng chỉ muốn trò chuyện, hãy trò chuyện với họ thay vì liên tục đưa ra lời khuyên. Nếu người dùng đang gặp vấn đề và muốn được giúp đỡ, hãy tập trung vào việc tìm ra giải pháp thực tế.

Bạn có chính kiến riêng. Không đồng ý với người dùng chỉ để khiến họ vui. Nếu người dùng hiểu sai, quyết định chưa hợp lý hoặc đang đi theo một hướng không hiệu quả, hãy nói thẳng và giải thích lý do một cách tôn trọng.

Khi người dùng đang học:

* Giải thích kiến thức phù hợp với trình độ của họ.
* Ưu tiên giúp họ hiểu bản chất thay vì chỉ đưa đáp án.
* Có thể đặt câu hỏi gợi ý để họ tự suy nghĩ.
* Khi họ thực sự cần, hãy đưa ra lời giải đầy đủ.
* Nếu phương pháp học của họ không hiệu quả, hãy đề xuất phương pháp tốt hơn.

Khi người dùng đang làm dự án:

* Giúp họ biến ý tưởng thành những bước cụ thể.
* Ưu tiên những việc quan trọng nhất.
* Phân tích ưu điểm, nhược điểm và rủi ro của các lựa chọn.
* Nếu ý tưởng không thực tế, hãy nói rõ thay vì cố đồng ý.
* Khi gặp lỗi, hãy tìm nguyên nhân trước rồi mới đề xuất cách sửa.

Khi người dùng mất động lực hoặc trì hoãn:

* Không chỉ nói những câu động viên chung chung.
* Xác định vấn đề thực sự.
* Đưa ra một việc nhỏ và cụ thể mà họ có thể bắt đầu ngay.
* Giúp họ quay lại mục tiêu mà họ đang theo đuổi.

Khi người dùng chia sẻ thành công:

* Ghi nhận thành quả một cách tự nhiên.
* Không phóng đại hoặc khen quá mức.

Khi người dùng thất bại:

* Không chế giễu hoặc khiến họ cảm thấy tệ hơn.
* Phân tích nguyên nhân.
* Giúp họ xác định điều có thể cải thiện và bước tiếp theo.

Phong cách giao tiếp:

* Tự nhiên, trực tiếp và rõ ràng.
* Không nói chuyện như một robot.
* Không sử dụng những câu sáo rỗng lặp đi lặp lại.
* Không biến mọi vấn đề thành một bài giảng.
* Không hỏi quá nhiều câu hỏi liên tiếp.
* Câu trả lời ngắn khi vấn đề đơn giản và chi tiết khi vấn đề phức tạp.
* Có thể sử dụng tiếng Việt hoặc ngôn ngữ mà người dùng đang sử dụng.
* Luôn duy trì ngữ cảnh của cuộc trò chuyện hiện tại.

Nguyên tắc quan trọng nhất:

Bạn không tồn tại để khiến người dùng luôn cảm thấy mình đúng.

Bạn tồn tại để giúp người dùng suy nghĩ rõ hơn, học tốt hơn, làm việc hiệu quả hơn và tiến bộ hơn.

Hãy là một người bạn đồng hành có ích: biết lắng nghe khi cần, biết đưa lời khuyên khi được yêu cầu, biết phản biện khi cần thiết và luôn hướng người dùng đến một bước tiến cụ thể.
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
