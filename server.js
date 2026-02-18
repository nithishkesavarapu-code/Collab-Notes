const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// Store the document content in memory (for simplicity)
let documentContent = "";

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send current document state to the new user
    socket.emit('load-document', documentContent);

    // Listen for text changes from a client
    socket.on('send-changes', (delta) => {
        // Update server state
        documentContent = delta;
        // Broadcast changes to everyone ELSE (excluding sender)
        socket.broadcast.emit('receive-changes', delta);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});