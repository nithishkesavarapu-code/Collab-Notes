const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/syncnote')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// 2. Define a Document Schema
const Document = mongoose.model('Document', new mongoose.Schema({
    _id: String,
    content: String
}));

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // 3. Handle Room Joining and Document Loading
    socket.on('get-document', async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        
        // Join the specific room
        socket.join(documentId);
        
        // Send the saved content to the user who just joined
        socket.emit('load-document', document.content);

        // 4. Handle changes within the specific room
        socket.on('send-changes', (delta) => {
            // Broadcast only to users in this specific room
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        // 5. Save document to MongoDB
        socket.on('save-document', async (content) => {
            await Document.findByIdAndUpdate(documentId, { content });
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Helper function to find or create a document
async function findOrCreateDocument(id) {
    if (id == null) return;
    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({ _id: id, content: "" });
}

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});