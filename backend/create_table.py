from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get database credentials from environment variables
DATABASE_USER = os.getenv('DATABASE_USER')
DATABASE_PASSWORD = os.getenv('DATABASE_PASSWORD')
DATABASE_HOST = os.getenv('DATABASE_HOST')
DATABASE_PORT = os.getenv('DATABASE_PORT')
DATABASE_NAME = os.getenv('DATABASE_NAME')

# Construct the PostgreSQL database URI
DATABASE_URI = f"postgresql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# Initialize Flask app
app = Flask(__name__)

# Set up SQLAlchemy to use the database URI from environment variables
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize SQLAlchemy
db = SQLAlchemy(app)

# Define the Conversation model (table structure)
class Conversation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_message = db.Column(db.Text, nullable=False)      
    bot_response = db.Column(db.Text, nullable=False)      
    is_favorite = db.Column(db.Boolean, default=False)

    def __repr__(self):
        return f"<Conversation {self.id}>"

# Create the table in the database
if __name__ == "__main__":
    with app.app_context():
        db.drop_all()     # Drop existing table (optional, for development)
        db.create_all()   # Create the new table with updated schema
    print("Table 'conversation' recreated successfully with updated columns.")
