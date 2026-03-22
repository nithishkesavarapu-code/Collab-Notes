const { redisClient } = require('../config/redis');
const supabase = require('../config/db');

module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-board', async (boardId, username) => {
            socket.join(boardId);
            socket.boardId = boardId;
            socket.username = username || `User_${Math.floor(Math.random() * 1000)}`;

            console.log(`${socket.username} joined board ${boardId}`);

            if (redisClient) {
                const presenceKey = `presence:${boardId}`;
                await redisClient.sadd(presenceKey, socket.username);
                const activeUsers = await redisClient.smembers(presenceKey);
                io.to(boardId).emit('presence-update', activeUsers);
            }
        });

        // Supabase Persistence Handlers
        socket.on('load-board', async (boardId, callback) => {
            if (!supabase) return callback({ canvas_state: null });

            const { data, error } = await supabase
                .from('boards')
                .select('canvas_state')
                .eq('id', boardId)
                .single();

            if (error || !data) {
                callback({ canvas_state: null });
            } else {
                callback({ canvas_state: data.canvas_state });
            }
        });

        socket.on('save-board', async (boardId, canvasDataUrl) => {
            if (!supabase || !boardId) return;
            
            const { error } = await supabase
                .from('boards')
                .upsert({ 
                    id: boardId, 
                    canvas_state: canvasDataUrl,
                    updated_at: new Date()
                }, { onConflict: 'id' });
                
            if (error) console.error("Error saving to Supabase:", error.message);
        });

        socket.on('draw-stroke', (strokeData) => {
            if (socket.boardId) {
                socket.broadcast.to(socket.boardId).emit('draw-stroke', strokeData);
            }
        });

        socket.on('clear-board', () => {
             if (socket.boardId) {
                 socket.broadcast.to(socket.boardId).emit('clear-board');
             }
        });

        socket.on('disconnect', async () => {
            console.log(`User disconnected: ${socket.username} (${socket.id})`);
            
            if (socket.boardId && socket.username && redisClient) {
                const presenceKey = `presence:${socket.boardId}`;
                await redisClient.srem(presenceKey, socket.username);
                const activeUsers = await redisClient.smembers(presenceKey);
                io.to(socket.boardId).emit('presence-update', activeUsers);
            }
        });
    });
};
