import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://localhost:5000";

  // Fetch conversation history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      const data = await res.json();
      setConversationHistory(data.history.reverse());
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch favorite conversations
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/favorites`);
      const data = await res.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Initial load
  useEffect(() => {
    fetchHistory();
    fetchFavorites();
  }, []);

  // Scroll chat to bottom when new message appears
  useEffect(() => {
    const chatArea = document.querySelector('.chat-messages');
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [chatMessages, loading]);

  // Handle sending a message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);

    // Add user's message immediately
    setChatMessages((prev) => [...prev, { role: 'user', content: input }]);

    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();

      // Add bot's reply
      setChatMessages((prev) => [...prev, { role: 'bot', content: data.response }]);
      setInput('');

      await fetchHistory();
      await fetchFavorites();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = async (conv) => {
    try {
      await fetch(`${BACKEND_URL}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: conv.user_message,
          bot_response: conv.bot_response,
          is_favorite: !conv.is_favorite
        }),
      });

      await fetchHistory();
      await fetchFavorites();
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  return (
    <div className="App">
      <div className="container">

        {/* Sidebar */}
        <div className="sidebar">
          <div className="favorites">
            <h3>⭐ Favorites</h3>
            {favorites.length > 0 ? (
              favorites.map((fav) => (
                <div key={fav.id || `${fav.user_message}-${fav.bot_response}`} className="favorite-conversation">
                  <p><strong>You:</strong> {fav.user_message}</p>
                  <p><strong>Bot:</strong> {fav.bot_response}</p>
                </div>
              ))
            ) : (
              <p>No favorites yet!</p>
            )}
          </div>

          <div className="conversation-history">
            <h3>🕑 History</h3>
            {conversationHistory.length > 0 ? (
              conversationHistory.map((conv) => (
                <div key={conv.id || `${conv.user_message}-${conv.bot_response}`} className="conversation">
                  <p><strong>You:</strong> {conv.user_message}</p>
                  <p><strong>Bot:</strong> {conv.bot_response}</p>
                  <button onClick={() => toggleFavorite(conv)}>
                    {conv.is_favorite ? '★ Unmark Favorite' : '☆ Mark as Favorite'}
                  </button>
                </div>
              ))
            ) : (
              <p>No conversations yet!</p>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          <h1>Chat with GPT 🚀</h1>

          <div className="chat-messages">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`message ${msg.role}`}>
                <strong>{msg.role === 'user' ? 'You' : 'Bot'}:</strong> {msg.content}
              </div>
            ))}
            {loading && (
              <div className="message bot">
                <strong>Bot:</strong> 
                <div className="typing">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="chat-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default App;
