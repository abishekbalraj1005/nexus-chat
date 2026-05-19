require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Message = require('./models/Message');

const app = express();
app.use(cors());
app.use(express.json({ limit: '100mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/personal-ai-chat')
  .then(async () => {
    console.log('Connected to MongoDB');
    const aiExists = await User.findOne({ isAI: true });
    if (!aiExists) {
      await User.create({
        username: 'Nexus AI',
        email: 'ai@nexus.com',
        password: await bcrypt.hash('randompass', 10),
        avatar: 'https://i.pravatar.cc/150?img=68',
        bio: 'I am your personal AI assistant.',
        isAI: true,
        online: true
      });
      console.log('Seeded AI Assistant');
    }
  })
  .catch(err => console.error('MongoDB connection error:', err));

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const existingUsername = await User.findOne({ username });
    if (existingUsername) return res.status(400).json({ error: 'Username already taken' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username, email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, username: user.username, email, avatar: user.avatar } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Search Users
app.get('/api/users/search', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const query = req.query.q || '';
    if (!query) return res.json({ users: [] });

    // Find users by username matching query (case-insensitive), excluding current user
    const users = await User.find({
      username: { $regex: query, $options: 'i' },
      _id: { $ne: decoded.id }
    }).select('-password').limit(10).lean();

    const formatted = users.map(u => ({ ...u, id: u._id.toString() }));
    res.json({ users: formatted });
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 1e8
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error('Authentication error'));
    socket.userId = decoded.id;
    next();
  });
});

io.on('connection', async (socket) => {
  const me = await User.findById(socket.userId);
  if (!me) return socket.disconnect();

  me.socketId = socket.id;
  me.online = true;
  await me.save();

  // Load all users the current user has interacted with + AI Assistant
  const interactedMessages = await Message.find({
    $or: [{ senderId: me._id }, { receiverId: me._id }]
  }).lean();
  
  const interactedUserIds = new Set();
  interactedMessages.forEach(m => {
    interactedUserIds.add(m.senderId.toString());
    interactedUserIds.add(m.receiverId.toString());
  });

  const aiUser = await User.findOne({ isAI: true });
  if (aiUser) interactedUserIds.add(aiUser._id.toString());
  interactedUserIds.delete(me._id.toString());

  const interactedUsers = await User.find({ _id: { $in: Array.from(interactedUserIds) } }).select('-password').lean();
  const formattedUsers = interactedUsers.map(u => ({ ...u, id: u._id.toString() }));

  const messages = await Message.find({
    $or: [{ senderId: me._id }, { receiverId: me._id }]
  }).sort({ createdAt: 1 }).lean();

  const formattedMessages = messages.map(m => ({
    id: m._id.toString(),
    senderId: m.senderId.toString(),
    receiverId: m.receiverId.toString(),
    text: m.text,
    audioBlob: m.audioData ? m.audioData.buffer : null,
    imageBase64: m.imageBase64,
    timestamp: m.createdAt,
    status: m.status
  }));

  socket.emit('init-data', { users: formattedUsers, messages: formattedMessages });
  socket.broadcast.emit('user-status-changed', { id: me._id.toString(), online: true });

  socket.on('send-message', async (data) => {
    try {
      const receiver = await User.findById(data.receiverId);
      const isOnline = receiver && receiver.socketId;

      const messageDoc = await Message.create({
        senderId: me._id,
        receiverId: data.receiverId,
        text: data.text,
        audioData: data.audioBlob ? Buffer.from(data.audioBlob) : null,
        imageBase64: data.imageBase64 || null,
        status: isOnline ? 'delivered' : 'sent'
      });

      const message = {
        id: messageDoc._id.toString(),
        senderId: messageDoc.senderId.toString(),
        receiverId: messageDoc.receiverId.toString(),
        text: messageDoc.text,
        audioBlob: data.audioBlob || null,
        imageBase64: messageDoc.imageBase64,
        timestamp: messageDoc.createdAt,
        status: messageDoc.status
      };
      
      socket.emit('new-message', message);

      if (receiver && receiver.socketId) {
        io.to(receiver.socketId).emit('new-message', message);
      }

      // Smart Mock AI Logic
      if (receiver && receiver.isAI) {
        setTimeout(async () => {
          io.to(socket.id).emit('user-typing', { userId: receiver._id.toString(), isTyping: true });
          
          setTimeout(async () => {
            let replyText = "I'm sorry, I'm just a simple AI. I don't fully understand that yet.";
            const msgLower = (data.text || '').toLowerCase();
            
            if (msgLower.includes('hello') || msgLower.includes('hi')) replyText = "Hello there! How can I assist you today?";
            else if (msgLower.includes('how are you')) replyText = "I'm operating perfectly and ready to help you with anything you need.";
            else if (msgLower.includes('joke')) replyText = "Why do programmers prefer dark mode? Because light attracts bugs!";
            else if (msgLower.includes('weather')) replyText = "I can't check the internet right now, but I hope it's sunny where you are!";
            else if (msgLower.includes('who are you')) replyText = "I am Nexus AI, your personal intelligent companion integrated right into this chat platform.";
            else if (data.imageBase64) replyText = "That's a nice image! What is it?";
            else if (data.audioBlob) replyText = "I heard your voice note! I can't transcribe audio yet, but it sounded great.";
            else if (msgLower.length > 0) replyText = `That's interesting. You said: "${data.text}". Tell me more about that.`;

            const aiReplyDoc = await Message.create({
              senderId: receiver._id,
              receiverId: me._id,
              text: replyText,
              status: 'sent'
            });
            
            io.to(socket.id).emit('user-typing', { userId: receiver._id.toString(), isTyping: false });
            io.to(socket.id).emit('new-message', {
              id: aiReplyDoc._id.toString(),
              senderId: receiver._id.toString(),
              receiverId: me._id.toString(),
              text: aiReplyDoc.text,
              timestamp: aiReplyDoc.createdAt,
              status: 'sent'
            });
          }, 1500 + Math.random() * 1000); 
        }, 500);
      }
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('typing-start', (receiverId) => {
    socket.broadcast.emit('user-typing', { userId: me._id.toString(), receiverId, isTyping: true });
  });

  socket.on('typing-stop', (receiverId) => {
    socket.broadcast.emit('user-typing', { userId: me._id.toString(), receiverId, isTyping: false });
  });

  socket.on('mark-read', async ({ senderId }) => {
    try {
      await Message.updateMany(
        { senderId: new mongoose.Types.ObjectId(senderId), receiverId: me._id, status: { $ne: 'read' } },
        { $set: { status: 'read' } }
      );

      const sender = await User.findById(senderId);
      if (sender && sender.socketId) {
        io.to(sender.socketId).emit('messages-read', {
          senderId,
          receiverId: me._id.toString()
        });
      }

      socket.emit('messages-read', {
        senderId,
        receiverId: me._id.toString()
      });
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  socket.on('delete-message', async ({ messageId }) => {
    try {
      const message = await Message.findById(messageId);
      if (message) {
        if (message.senderId.toString() === me._id.toString() || message.receiverId.toString() === me._id.toString()) {
          await Message.findByIdAndDelete(messageId);
          
          socket.emit('message-deleted', { messageId });
          
          const receiverId = message.senderId.toString() === me._id.toString() ? message.receiverId : message.senderId;
          const receiver = await User.findById(receiverId);
          if (receiver && receiver.socketId) {
            io.to(receiver.socketId).emit('message-deleted', { messageId });
          }
        }
      }
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  });

  socket.on('disconnect', async () => {
    me.online = false;
    me.lastSeen = new Date();
    await me.save();
    socket.broadcast.emit('user-status-changed', { id: me._id.toString(), online: false, lastSeen: me.lastSeen });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`);
});
