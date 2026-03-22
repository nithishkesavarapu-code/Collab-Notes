require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

// Import Configs & Routes
const { pubClient, subClient } = require('./config/redis');
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors());
app.use(express.json());

// Main API Route
app.use('/api', apiRoutes);

const server = http.createServer(app);

// Socket.io Setup
const io = new Server(server, {
  cors: {
    origin: "*", // allow frontend access
    methods: ["GET", "POST"]
  }
});

// Configure Redis adapter if clients exist
if (pubClient && subClient) {
  io.adapter(createAdapter(pubClient, subClient));
  console.log("Socket.io Redis adapter attached.");
}

// Import external Socket.io handler
const socketHandler = require('./socket/index');
socketHandler(io);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
