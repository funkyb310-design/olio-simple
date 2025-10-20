require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Listing = require('./models/Listing');
const Post = require('./models/Post');
const Request = require('./models/Request');
const Message = require('./models/Message');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register attempt received:', req.body);
    const { email, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log('Missing fields:', { email: !!email, password: !!password, firstName: !!firstName, lastName: !!lastName });
      return res.status(400).json({ 
        message: 'All fields are required',
        missing: {
          email: !email,
          password: !password,
          firstName: !firstName,
          lastName: !lastName
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('User already exists:', email);
      return res.status(400).json({ message: 'User with this email already exists. Please login instead.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName
    });
    
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login attempt received:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('Searching for user with email:', email);
    const user = await User.findOne({ email });
    
    if (!user) {
      console.log('User not found for email:', email);
      return res.status(401).json({ message: 'Invalid credentials - user not found' });
    }
    
    console.log('User found:', user.email, 'Checking password...');

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({ message: 'Invalid credentials - wrong password' });
    }

    console.log('Login successful, generating token...');
    const token = jwt.sign(
      { userId: user._id },
      'your_jwt_secret',
      { expiresIn: '24h' }
    );

    console.log('Sending successful response');
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed: ' + error.message });
  }
});

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({ message: 'No token provided' });
    
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Listings routes
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ message: 'Error fetching listings' });
  }
});

app.post('/api/listings', authenticateToken, async (req, res) => {
  try {
    const listing = new Listing({
      ...req.body,
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`
    });
    await listing.save();
    res.status(201).json(listing);
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ message: 'Error creating listing' });
  }
});

// Forum/Community Posts routes
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    console.log('Fetched posts:', posts.length);
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    console.log('Creating post:', req.body);
    const { content, category, image } = req.body;
    
    if (!content || !category) {
      return res.status(400).json({ message: 'Content and category are required' });
    }
    
    const post = new Post({
      content,
      category,
      image: image || '',
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      userPhoto: 'https://picsum.photos/100/100',
      likes: 0,
      comments: 0
    });
    
    await post.save();
    console.log('Post created successfully:', post._id);
    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post: ' + error.message });
  }
});

app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Request routes
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { listingId, message, pickupTime } = req.body;
    
    // Get listing to find owner
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }
    
    if (listing.status !== 'available') {
      return res.status(400).json({ message: 'Item is no longer available' });
    }
    
    // Check if user already requested this item
    const existingRequest = await Request.findOne({
      listingId,
      requesterId: req.user._id,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ message: 'You already requested this item' });
    }
    
    const request = new Request({
      listingId,
      requesterId: req.user._id,
      requesterName: `${req.user.firstName} ${req.user.lastName}`,
      ownerId: listing.userId,
      ownerName: listing.userName,
      message,
      pickupTime
    });
    
    await request.save();
    console.log('Request created:', request._id);
    res.status(201).json(request);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Error creating request' });
  }
});

// Get requests for current user (as owner)
app.get('/api/requests/received', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ ownerId: req.user._id })
      .populate('listingId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Get requests made by current user
app.get('/api/requests/sent', authenticateToken, async (req, res) => {
  try {
    const requests = await Request.find({ requesterId: req.user._id })
      .populate('listingId')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Error fetching requests' });
  }
});

// Accept/Reject request
app.put('/api/requests/:id', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body; // 'accepted' or 'rejected'
    
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Verify user is the owner
    if (request.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    request.status = status;
    
    if (status === 'accepted') {
      request.acceptedAt = new Date();
      // Set expiry to 2 hours from now
      request.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
      
      // Update listing status
      const listing = await Listing.findById(request.listingId);
      if (listing) {
        listing.status = 'reserved';
        listing.reservedBy = request.requesterId;
        listing.reservedAt = new Date();
        listing.expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
        await listing.save();
      }
      
      // Reject all other pending requests for this listing
      await Request.updateMany(
        { 
          listingId: request.listingId, 
          _id: { $ne: request._id },
          status: 'pending'
        },
        { status: 'rejected' }
      );
    }
    
    await request.save();
    console.log('Request updated:', request._id, 'Status:', status);
    res.json(request);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ message: 'Error updating request' });
  }
});

// Message routes
app.post('/api/messages', authenticateToken, async (req, res) => {
  try {
    const { listingId, receiverId, content, requestId } = req.body;
    
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }
    
    // Get receiver info
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    
    const message = new Message({
      listingId,
      requestId,
      senderId: req.user._id,
      senderName: `${req.user.firstName} ${req.user.lastName}`,
      receiverId,
      receiverName: `${receiver.firstName} ${receiver.lastName}`,
      content: content.trim()
    });
    
    await message.save();
    console.log('Message sent:', message._id);
    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Error sending message' });
  }
});

// Get all conversations for current user
app.get('/api/messages/conversations', authenticateToken, async (req, res) => {
  try {
    // Get all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [
        { senderId: req.user._id },
        { receiverId: req.user._id }
      ]
    }).populate('listingId').sort({ createdAt: -1 });
    
    // Group by conversation (listing + other user)
    const conversationsMap = new Map();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId.toString() === req.user._id.toString() 
        ? msg.receiverId.toString() 
        : msg.senderId.toString();
      
      const key = `${msg.listingId?._id || 'unknown'}_${otherUserId}`;
      
      if (!conversationsMap.has(key)) {
        conversationsMap.set(key, {
          listingId: msg.listingId?._id,
          listingTitle: msg.listingId?.title || 'Item',
          listingImage: msg.listingId?.imageUrl,
          otherUserId,
          otherUserName: msg.senderId.toString() === req.user._id.toString() 
            ? msg.receiverName 
            : msg.senderName,
          lastMessage: msg.content,
          lastMessageTime: msg.createdAt,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conversation = conversationsMap.get(key);
      conversation.messages.push(msg);
      
      // Count unread messages
      if (msg.receiverId.toString() === req.user._id.toString() && !msg.isRead) {
        conversation.unreadCount++;
      }
    });
    
    const conversations = Array.from(conversationsMap.values());
    res.json(conversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Error fetching conversations' });
  }
});

// Get messages for a specific conversation
app.get('/api/messages/conversation/:listingId/:otherUserId', authenticateToken, async (req, res) => {
  try {
    const { listingId, otherUserId } = req.params;
    
    const messages = await Message.find({
      listingId,
      $or: [
        { senderId: req.user._id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: req.user._id }
      ]
    }).sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      {
        listingId,
        senderId: otherUserId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );
    
    res.json(messages);
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Error fetching messages' });
  }
});

// Mark messages as read
app.put('/api/messages/read/:conversationKey', authenticateToken, async (req, res) => {
  try {
    const { conversationKey } = req.params;
    const [listingId, otherUserId] = conversationKey.split('_');
    
    await Message.updateMany(
      {
        listingId,
        senderId: otherUserId,
        receiverId: req.user._id,
        isRead: false
      },
      { isRead: true }
    );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Error marking messages as read' });
  }
});

// Auto-cleanup expired listings
setInterval(async () => {
  try {
    const now = new Date();
    
    // Find and delete expired listings
    const expiredListings = await Listing.find({
      expiresAt: { $lte: now },
      status: { $in: ['reserved', 'sold'] }
    });
    
    if (expiredListings.length > 0) {
      await Listing.deleteMany({
        expiresAt: { $lte: now },
        status: { $in: ['reserved', 'sold'] }
      });
      console.log(`🗑️  Deleted ${expiredListings.length} expired listings`);
    }
    
    // Delete expired requests
    const expiredRequests = await Request.deleteMany({
      expiresAt: { $lte: now }
    });
    
    if (expiredRequests.deletedCount > 0) {
      console.log(`🗑️  Deleted ${expiredRequests.deletedCount} expired requests`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://oliouser:VGpHauhkbzTLsRbR@cluster0.uo8aicj.mongodb.net/olio?retryWrites=true&w=majority&appName=Cluster0';

console.log('Connecting to MongoDB Atlas...');
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Successfully connected to MongoDB Atlas!');
  console.log('Database: olio');
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

const PORT = 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://172.20.10.11:${PORT}`);
  console.log('Press Ctrl+C to stop');
});