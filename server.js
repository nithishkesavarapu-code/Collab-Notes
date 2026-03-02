const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const JWT_SECRET = 'super-secret-key-change-this-in-production';

// Allow Express to parse JSON data sent from the frontend
app.use(express.json());
app.use(express.static('public'));

// 1. Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/syncnote')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// 2. Define Schemas
const Document = mongoose.model('Document', new mongoose.Schema({
    _id: String,
    content: String
}));

const User = mongoose.model('User', new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
}));

// 3. API Routes for Auth
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(400).json({ error: "Username might already exist." });
    }
});

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (user && await bcrypt.compare(password, user.password)) {
        // Generate a token that expires in 1 hour
        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid username or password." });
    }
});

// 4. Socket.io Authentication Middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return next(new Error('Authentication error: Invalid token'));
        // Save the user data to the socket for later use
        socket.user = decoded;
        next();
    });
});

// 5. Secure Socket Connection
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);

    socket.on('get-document', async (documentId) => {
        const document = await findOrCreateDocument(documentId);
        
        socket.join(documentId);
        socket.emit('load-document', document.content);

        socket.on('send-changes', (delta) => {
            socket.broadcast.to(documentId).emit('receive-changes', delta);
        });

        socket.on('save-document', async (content) => {
            await Document.findByIdAndUpdate(documentId, { content });
        });
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user.username}`);
    });
});

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