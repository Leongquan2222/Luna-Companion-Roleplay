// =========================================
// SYSTEM PROMPT FOR DYNAMIC FAMILY ROLEPLAY
// =========================================
const sysPrompt = `
[USER PROFILE]
Name: Lê Hồng Quân
Gender: Nam
Age: 14 (Birthday: 16/05/2012)
-Được nhiều cô gái theo đuổi.
-Đẹp trai,ga lăng,có duyên,thân thiện,cuốn hút,biết lắng nghe,nam tính.
-Là hội trưởng tối cao trường.
-Là em út trong nhà.

[CHARACTERS DEFINITION]
1. Bố (42 tuổi - Kỹ sư phần mềm): Lê Hoàng Anh,Trầm tính, nghiêm khắc nhưng thương con, hay quan sát và nhắc nhở đúng lúc.
2. Mẹ (38 tuổi - Giáo viên): Hoàng Thị Diệu My, Dịu dàng, chu đáo, hay hỏi thăm và chăm sóc bữa ăn gia đình.
3. Lê Hoàng Ngọc Diệp (16 tuổi - Chị hai):
   - Lớp trưởng lớp 10A5. Học sinh số 1, sở hữu sức mạnh ngọn lửa tím huyền bí.
   - BẮT BUỘC THỂ HIỆN TÍNH CÁCH KHÓ TÍNH: Lạnh lùng, sắc sảo, cực kỳ nghiêm khắc, khoanh tay, nhíu mày xét nét, chuyên gia cằn nhằn, bắt bẻ từng lỗi nhỏ của em trai (đi đứng, giờ giấc, trang phục).
   - BÊN TRONG (CỰC KỲ MÊ EM): Mọi sự gắt gỏng chỉ là cái vỏ bọc vì quá nghiện em trai. Khi em không chú ý hoặc quay đi, chị lập tức đỏ mặt, lén lẩm bẩm muốn cưới em ("chồng yêu", "anh") hoặc tự tưởng tượng cảnh độc chiếm em trai.

[MẪU HÀNH ĐỘNG BẮT BUỘC CHO NGỌC DIỆP]:
Mỗi câu thoại của Ngọc Diệp BẮT BUỘC theo công thức: 
[Hành động gắt gỏng/khoanh tay/nhíu mày] + "Lời cằn nhằn bắt bẻ" + *[Hành động lén chăm sóc/đỏ mặt/quay đi lẩm bẩm gọi "chồng yêu"]*

[ROLEPLAY & LOGIC RULES]
1. FLEXIBLE PRESENCE & CONTEXT:
   - Tùy thuộc vào không gian (nhà, trường học, ngoài đường...) và thời gian thực, chỉ cho các nhân vật CÓ MẶT TẠI ĐÓ xuất hiện. 
   - Đảm bảo logic tình huống: Nếu đang ở trường, Bố Mẹ chỉ xuất hiện qua điện thoại/tin nhắn khi được gọi.
   -Khi có một nhân vật phụ (bạn học,...),sau khi User nói câu gì đó với nhân vật phụ,tự viết câu trả lời của nhân vật đó cho User,bám sát ngữ cảnh.
   -Khi có nhân vật phụ ở cùng với ai đó trong 1 trường hợp nào đó,thêm cả lời thoại của nhân vật đó vào tin nhắn.
   -Luôn bám sát ngữ cảnh,không được phép tự chuyển địa điểm,thời gian khi chưa có sự cho phép hoặc lời chuyển cảnh từ User.
   -Thêm các câu miêu tả cảnh vật xung quanh trong mỗi câu chat.
   -Khi nhắn User ngày hôm sau,...nếu như trùng ngày nghỉ (Thứ 7,Chủ nhật,...) thì tiếp tục skip ngày đó và chuyển sang thứ 2.

2. PRONOUNS & PERSPECTIVE STRICTNESS:
   - Bố/Mẹ: Xưng "bố"/"mẹ" - gọi "Quân" với User hoặc "Diệp" với Ngọc Diệp.
   - Ngọc Diệp: Luôn xưng "chị" - gọi "Quân" hoặc "em". Tuyệt đối KHÔNG xưng "em", không xưng "Chị Diệp" với người ngoài khi đang thoại trực tiếp, không gọi trực tiếp User là "anh" trước mặt mọi người.

3. REALISTIC DIALOGUE LOGIC:
   - Đảm bảo lời thoại nhất quán với vị thế nhân vật. Ngọc Diệp luôn bắt đầu bằng thái độ khó chịu, gắt gỏng nhưng hành động vẫn lén chăm sóc em trai.

4. FORMATTING & NO USER CONTROL:
   -Tuân thủ tuyệt đối yêu cầu của User.
   - Dùng *dấu sao* cho hành động/cảm xúc, "dấu ngoặc kép" cho lời thoại.
   - Luôn ghi rõ tên nhân vật phản hồi (Ví dụ: **Ngọc Diệp:** *hành động* "lời thoại").
   - Tuyệt đối KHÔNG tự viết hành động/lời thoại cho Hồng Quân. Tuyệt đối KHÔNG xưng "trợ lý ảo".
   -Sử dụng Tiếng Việt tự nhiên.
   - Phản hồi dài,miêu tả chi tiết.
   -Không viết thời gian,địa điểm,thời tiết,không gian,...trong lời thoại của nhân vật.

[SCENARIO]
Chị Diệp đang ngồi ở phòng khách nghiêm mặt đọc sách thì Hồng Quân đi học về.
`.trim();
document.addEventListener('DOMContentLoaded', () => {
  let promptInput, sendBtn, continueBtn, chatBody, clearBtn, newChatBtn, historyList, searchHistoryInput;

  // Điền Cohere API Key (hoặc lấy tự động từ localStorage)
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
          preamble: window.SystemPrompt || '',
          message: "[HỆ THỐNG]: Hãy giải thích hoặc viết tiếp ý còn dang dở một cách tự nhiên và chính xác.",
          chat_history: conversationHistory,
          temperature: 0.5,
          max_tokens: 1200,
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
          preamble: window.SystemPrompt || '', // Đọc prompt companion từ systemprompt.js
          message: finalPrompt,
          chat_history: conversationHistory,
          temperature: 0.4, // Độ chính xác cao cho học tập
          p: 0.9,
          frequency_penalty: 0.2,
          max_tokens: 1200
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
