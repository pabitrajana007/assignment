# 💬 ChatGPT Web App (React + Flask)

This is a full-stack chatbot web application built with **ReactJS (frontend)** and **Flask (backend)**. Users can chat with a GPT-powered assistant, view conversation history, and bookmark favorite responses. The app also stores and retrieves messages using a **PostgreSQL database**.

---

## ✨ Features

- 🔁 Chat with a GPT-based assistant  
- 💾 View complete conversation history  
- ⭐ Mark and view favorite responses  
- 🚀 Smooth UI with loading states and responsive design

---

## 🛠 Tech Stack

### Frontend:
- ReactJS  


### Backend:
- Python (Flask)  
- OpenAI  
- PostgreSQL

---

## env file Setup

Create an env file and add following :

OPENAI_API_KEY=

DATABASE_USER=postgres
DATABASE_PASSWORD=
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=chatbot



## 🧱 Database Setup

To set up the PostgreSQL database:

1. Make sure PostgreSQL is installed and running.
2. Create a database named `chatbot`:
   ```bash
   createdb chatbot
3. Run create_table.py script in backend folder

## Backend Setup

Run app.py

## Frontend Setup

In the project directory, you can run:

cd frontend
```bash
npm install
```
```bash
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

