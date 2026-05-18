const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://i.pravatar.cc/150?img=11' },
  bio: { type: String, default: 'Hey there! I am using Personal AI Chat.' },
  online: { type: Boolean, default: false },
  lastSeen: { type: Date, default: Date.now },
  socketId: { type: String },
  isAI: { type: Boolean, default: false },
  
  // Notification Support
  fcmTokens: [{ type: String }],
  notificationSettings: {
    sound: { type: Boolean, default: true },
    desktopPush: { type: Boolean, default: true },
    mobilePush: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
