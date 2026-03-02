# SyncNote: Real-Time Collaborative Text Editor

**SyncNote** is a lightweight, real-time collaborative text editor allowing multiple users to edit a document simultaneously with low latency. Built to demonstrate **concurrency handling**, **event-driven architecture**, and **secure access**, mirroring the core functionality of tools like Microsoft Loop or Google Docs.

## 🚀 Key Features
* **Real-Time Synchronization:** Updates are propagated instantly across all connected clients using WebSockets.
* **Room Support:** Users can join or create isolated document sessions via URL parameters (e.g., `/?room=meeting-notes`).
* **Document Persistence:** Document states are automatically saved to a MongoDB database, ensuring no data is lost when the server restarts.
* **Secure Authentication:** User registration and login powered by JSON Web Tokens (JWT) and securely hashed passwords (bcrypt).
* **Concurrency Handling:** Manages simultaneous edits without page refreshes.

![ScreenRecording2026-02-19005226-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/73b6f685-410b-4a97-b252-2a48e2792c4e)

## 🛠️ Tech Stack
* **Backend:** Node.js, Express.js
* **Database:** MongoDB, Mongoose
* **Communication:** Socket.io (WebSockets)
* **Security:** JSON Web Tokens (JWT), bcryptjs
* **Frontend:** HTML5, CSS3, Vanilla JavaScript

## ⚙️ Architecture & Logic
The application utilizes a **Client-Server architecture** with bi-directional communication and persistent state:
1.  **Authentication:** Users log in via a REST API. The server responds with a JWT, which the client uses to authenticate the WebSocket handshake.
2.  **Connection & Rooms:** Clients connect to a specific room. The server fetches the latest document state for that room from MongoDB and loads it for the user.
3.  **Event Broadcasting:** When Client A types, a `send-changes` event emits the delta.
4.  **Propagation & Persistence:** The server receives the delta, broadcasts it to all *other* clients in the same room, and asynchronously updates the database.

## 🏃‍♂️ How to Run locally

### Prerequisites
* Node.js (v14 or higher)
* MongoDB (Installed and running locally on the default port `27017`)

### Installation
1.  Clone the repository:
    ```bash
    git clone [https://github.com/your-username/Collab-Notes.git](https://github.com/your-username/Collab-Notes.git)
    cd Collab-Notes
    ```
    
2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start your local MongoDB server (if not already running as a background service).

4.  Start the Node server:
    ```bash
    node server.js
    ```

5.  Open `http://localhost:3000` in two different browser tabs. Register a user, log in, and join the same room to test the real-time collaboration.

## 🔮 Future Improvements (Roadmap)
* [ ] **Rich Text Formatting:** Upgrade the raw textarea to a rich-text editor like Quill.js.
* [ ] **Operational Transformation (OT):** Implement OT algorithms (e.g., via ShareDB) to handle complex cursor movements and advanced merge conflicts.
* [ ] **User Dashboard:** A home screen where logged-in users can easily view, manage, and delete a list of their previously edited documents.
