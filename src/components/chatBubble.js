export function createChatBubble(text, isUser = false) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${isUser ? 'user-bubble' : 'ai-bubble'}`;
    bubble.innerHTML = `
    <div class="bubble-avatar">${isUser ? '👤' : '🤖'}</div>
    <div class="bubble-content">
      <p>${text}</p>
    </div>
  `;
    return bubble;
}

export function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'chat-bubble ai-bubble typing-indicator';
    indicator.innerHTML = `
    <div class="bubble-avatar">🤖</div>
    <div class="bubble-content">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
    return indicator;
}
