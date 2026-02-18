# SyncNote: Real-Time Collaborative Text Editor

**SyncNote** is a lightweight, real-time collaborative text editor allowing multiple users to edit a document simultaneously with low latency. Built to demonstrate **concurrency handling** and **event-driven architecture**, mirroring the core functionality of tools like Microsoft Loop or Google Docs.

## 🚀 Key Features
* **Real-Time Synchronization:** Updates are propagated instantly across all connected clients using WebSockets.
* **Concurrency Handling:** Manages simultaneous edits without page refreshes.
* **Operational Consistency:** Ensures all users see the same document state.
* **Live Presence:** Immediate feedback when new users join the session.

![ScreenRecording2026-02-19005226-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/73b6f685-410b-4a97-b252-2a48e2792c4e)


## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Communication:** Socket.io (WebSockets)
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## ⚙️ Architecture & Logic
The application utilizes a **Client-Server architecture** with bi-directional communication:
1.  **Connection:** Clients establish a persistent WebSocket handshake with the Node.js server.
2.  **Event Broadcasting:** When Client A types, a `send-changes` event emits the delta.
3.  **Propagation:** The server receives the delta and broadcasts a `receive-changes` event to all *other* clients (excluding the sender).
4.  **State Management:** The server maintains the "source of truth" in memory (scalable to Redis/Database).

## 🏃‍♂️ How to Run locally

### Prerequisites
* Node.js (v14 or higher)

### Installation
1.  Clone the repository
    
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the server:
    ```bash
    node server.js
    ```
4.  Open `http://localhost:3000` in two different browser tabs/windows to test the collaboration.

## 🔮 Future Improvements (Roadmap)
* [ ] **Operational Transformation (OT):** Implement OT algorithms to handle complex merge conflicts.
* [ ] **Persistence:** Integrate MongoDB to save document history.
* [ ] **Authentication:** Add user login via JWT.
* [ ] **Room Support:** Allow users to create unique rooms (e.g., `/room/meeting-notes`).
