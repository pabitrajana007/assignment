from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os
from flask_sqlalchemy import SQLAlchemy

# Load environment variables
load_dotenv()

# OpenAI setup
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=api_key)

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Database config
DATABASE_USER = os.getenv('DATABASE_USER')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')
DATABASE_PORT = os.getenv('DATABASE_PORT')
DATABASE_NAME = os.getenv('DATABASE_NAME')

DATABASE_URI = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Conversation model
class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_message = db.Column(db.Text, nullable=False)
    bot_response = db.Column(db.Text, nullable=False)
    is_favorite = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Conversation {self.id}>"

# Create tables
with app.app_context():
    db.create_all()

# Route: Chat and save (continuous memory)
@app.route('/chat', methods=['POST'])
def chat():
    user_message = request.json.get("message")
    is_favorite = request.json.get("is_favorite", False)

    if not user_message:
        return jsonify({"response": "No input message received."}), 400

    try:
        # Fetch the conversation history from DB
        history = Conversation.query.order_by(Conversation.id).all()

        # Build message history for OpenAI API
        messages = [{"role": "system", "content": "You are a helpful assistant."}]
        for convo in history:
            messages.append({"role": "user", "content": convo.user_message})
            messages.append({"role": "assistant", "content": convo.bot_response})

        # Add the new user message
        messages.append({"role": "user", "content": user_message})

        # Send to OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        reply = response.choices[0].message.content.strip()

        # Save new message + response to database
        conversation = Conversation(
            user_message=user_message,
            bot_response=reply,
            is_favorite=is_favorite
        )
        db.session.add(conversation)
        db.session.commit()

        return jsonify({
            "response": reply,
            "conversation_id": conversation.id
        })

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

# Route: Get all favorites
@app.route('/favorites', methods=['GET'])
def get_favorites():
    try:
        favorites = Conversation.query.filter_by(is_favorite=True).all()
        favorite_conversations = [
            {
                "id": conv.id,
                "user_message": conv.user_message,
                "bot_response": conv.bot_response,
                "is_favorite": conv.is_favorite
            }
            for conv in favorites
        ]
        return jsonify({"favorites": favorite_conversations})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

# Route: Get full history
@app.route('/history', methods=['GET'])
def get_history():
    try:
        history = Conversation.query.order_by(Conversation.id).all()
        all_conversations = [
            {
                "id": conv.id,
                "user_message": conv.user_message,
                "bot_response": conv.bot_response,
                "is_favorite": conv.is_favorite
            }
            for conv in history
        ]
        return jsonify({"history": all_conversations})
    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

# Route: Update favorite status
@app.route('/bookmark', methods=['POST'])
def update_favorite():
    try:
        data = request.json
        user_message = data.get("user_message")
        bot_response = data.get("bot_response")
        is_favorite = data.get("is_favorite")

        conversation = Conversation.query.filter_by(
            user_message=user_message,
            bot_response=bot_response
        ).first()

        if conversation:
            conversation.is_favorite = is_favorite
            db.session.commit()
            return jsonify({"message": "Favorite status updated."}), 200
        else:
            return jsonify({"error": "Conversation not found."}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run server
if __name__ == "__main__":
    app.run(debug=True)
