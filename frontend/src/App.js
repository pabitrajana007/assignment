import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);

  const BACKEND_URL = "http://localhost:5000";

  // Fetch all conversation history
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/history`);
      const data = await res.json();
      setConversationHistory(data.history.reverse()); // Show latest first
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch all favorite conversations
  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/favorites`);
      const data = await res.json();
      setFavorites(data.favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  // Load data on initial render
  useEffect(() => {
    fetchHistory();
    fetchFavorites();
  }, []);

  // Auto-scroll to bottom when new response arrives
  useEffect(() => {
    const chatArea = document.querySelector('.chat-area');
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [response]);

  // Send a message to the bot
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setResponse(data.response);
      setInput('');
      fetchHistory();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle favorite status for a conversation
  const toggleFavorite = async (conv) => {
    const updatedStatus = !conv.is_favorite;

    try {
      await fetch(`${BACKEND_URL}/bookmark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_message: conv.user_message,
          bot_response: conv.bot_response,
          is_favorite: updatedStatus
        }),
      });

      fetchHistory();
      fetchFavorites();
    } catch (error) {
      console.error("Error updating favorite:", error);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="sidebar">
          <div className="favorites">
            <h3>Favorites</h3>
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
            <h3>History</h3>
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
              <p>No conversation history yet!</p>
            )}
          </div>
        </div>

        <div className="chat-area">
          <h1>Chat with GPT</h1>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send"}
            </button>
          </form>

          {loading && (
            <div className="chat-response">Loading...</div>
          )}

          {!loading && response && (
            <div className="chat-response">
              <strong>Bot:</strong> {response}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
