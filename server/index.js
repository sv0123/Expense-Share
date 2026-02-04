require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for dev simplicity
        methods: ['GET', 'POST'],
    },
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Socket.io connection handler
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-group', (groupId) => {
        socket.join(groupId);
        console.log(`Socket ${socket.id} joined group ${groupId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make io accessible to routes
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/expense-sharing-app')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Routes
app.use('/api/groups', require('./routes/groupRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/settlements', require('./routes/settlementRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

app.get('/', (req, res) => {
    res.send('API is running...');
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
