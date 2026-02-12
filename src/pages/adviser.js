import { renderNavbar } from '../components/navbar.js';
import { renderFooter } from '../components/footer.js';
import { createChatBubble, createTypingIndicator } from '../components/chatBubble.js';
import { askGroq } from '../lib/groq.js';

const STARTER_QUESTIONS = [
    'What is the history of Raigad Fort?',
    'Which forts are best for monsoon trekking?',
    'Tell me about medicinal plants near Sinhagad.',
    'What are the top 5 forts for beginners?',
    'Which sea forts can I visit in Maharashtra?',
];

export function renderAdviser(app) {
    app.innerHTML = '';
    app.appendChild(renderNavbar());

    const main = document.createElement('main');
    main.className = 'page-content adviser-page';
    main.innerHTML = `
    <section class="page-hero adviser-hero">
      <h1 class="page-title">🤖 AI Fort-Flora Adviser</h1>
      <p class="page-subtitle">Ask me anything about Maharashtra's forts, flora, trekking, and heritage</p>
    </section>
    <section class="chat-section">
      <div class="chat-container">
        <div class="chat-messages" id="chatMessages">
          <div class="chat-welcome">
            <div class="welcome-icon">🏰🌿</div>
            <h3>Welcome to Fort-Flora AI Adviser!</h3>
            <p>I can help you with fort history, trekking tips, flora information, and more.</p>
          </div>
          <div class="starter-questions" id="starterQuestions">
            <p class="starter-label">Try asking:</p>
            ${STARTER_QUESTIONS.map(
        (q) => `<button class="starter-btn" data-question="${q}">${q}</button>`
    ).join('')}
          </div>
        </div>
        <div class="chat-input-area">
          <input type="text" id="chatInput" class="chat-input" placeholder="Ask about forts, flora, trekking..." />
          <button id="chatSend" class="chat-send-btn" aria-label="Send message">
            <span>➤</span>
          </button>
        </div>
      </div>
    </section>
  `;

    app.appendChild(main);
    app.appendChild(renderFooter());

    const messagesEl = main.querySelector('#chatMessages');
    const inputEl = main.querySelector('#chatInput');
    const sendBtn = main.querySelector('#chatSend');
    const starterEl = main.querySelector('#starterQuestions');

    let isProcessing = false;

    async function sendMessage(text) {
        if (!text.trim() || isProcessing) return;
        isProcessing = true;

        // Hide starters
        if (starterEl) starterEl.style.display = 'none';

        // Add user bubble
        messagesEl.appendChild(createChatBubble(text, true));

        // Add typing indicator
        const typing = createTypingIndicator();
        messagesEl.appendChild(typing);
        messagesEl.scrollTop = messagesEl.scrollHeight;

        inputEl.value = '';
        inputEl.disabled = true;
        sendBtn.disabled = true;

        // Get AI response
        const response = await askGroq(text);

        // Remove typing indicator and add AI bubble
        typing.remove();
        messagesEl.appendChild(createChatBubble(response, false));
        messagesEl.scrollTop = messagesEl.scrollHeight;

        inputEl.disabled = false;
        sendBtn.disabled = false;
        inputEl.focus();
        isProcessing = false;
    }

    sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
    inputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMessage(inputEl.value);
    });

    // Starter question clicks
    messagesEl.querySelectorAll('.starter-btn').forEach((btn) => {
        btn.addEventListener('click', () => sendMessage(btn.dataset.question));
    });
}
