# Messaging Feature Implementation Summary

## ✅ What Has Been Created

### 1. Backend Components

#### **Message Model** (`backend/models/Message.js`)
- Stores messages between users about specific listings
- Fields include:
  - `listingId` - The item being discussed
  - `senderId` / `receiverId` - Users in the conversation
  - `content` - Message text
  - `isRead` - Read status
  - `createdAt` - Timestamp

#### **Backend API Endpoints** (added to `backend/server.js`)
- `POST /api/messages` - Send a new message
- `GET /api/messages/conversations` - Get all conversations for logged-in user
- `GET /api/messages/conversation/:listingId/:otherUserId` - Get messages in a specific conversation
- `PUT /api/messages/read/:conversationKey` - Mark messages as read

### 2. Frontend Components

#### **ChatScreen** (`src/screens/ChatScreen.js`)
A complete chat interface with:
- Real-time message display
- Send/receive messages
- Message bubbles (left for received, right for sent)
- Listing info banner at top
- Auto-scrolling to latest message
- Message polling every 5 seconds
- Read receipts

#### **API Service Updates** (`src/services/api.js`)
Added methods:
- `sendMessage(messageData)`
- `getConversations()`
- `getConversationMessages(listingId, otherUserId)`
- `markMessagesAsRead(conversationKey)`

## 🔧 What Needs to Be Done

### Update App.js to Include Messaging

You need to:

1. **Import ChatScreen** at the top of App.js:
```javascript
import ChatScreen from './src/screens/ChatScreen';
```

2. **Add state for chat** in AppContent function:
```javascript
const [chatData, setChatData] = useState(null);
```

3. **Update MessagesScreen** to load actual conversations:
```javascript
const MessagesScreen = ({ onBack, onNavigate, onOpenChat, user }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const convos = await apiService.getConversations();
      setConversations(convos);
    } catch (error) {
      console.error('Load conversations error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.exploreHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.exploreTitle}>Messages</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.messagesContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>No messages yet</Text>
            <Text style={styles.emptyStateText}>
              Your conversations about items will appear here
            </Text>
          </View>
        ) : (
          <FlatList
            data={conversations}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.messageItem}
                onPress={() => onOpenChat({
                  listing: {
                    _id: item.listingId,
                    title: item.listingTitle,
                    imageUrl: item.listingImage
                  },
                  otherUser: {
                    id: item.otherUserId,
                    name: item.otherUserName
                  }
                })}
              >
                <Image 
                  source={{ uri: item.listingImage }} 
                  style={styles.conversationImage}
                />
                <View style={styles.messageContent}>
                  <View style={styles.messageHeader}>
                    <Text style={styles.messageFrom}>{item.otherUserName}</Text>
                    <Text style={styles.messageTime}>{formatTime(item.lastMessageTime)}</Text>
                  </View>
                  <Text style={styles.listingName} numberOfLines={1}>{item.listingTitle}</Text>
                  <Text style={styles.messageText} numberOfLines={2}>
                    {item.lastMessage}
                  </Text>
                </View>
                {item.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{item.unreadCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `${item.listingId}_${item.otherUserId}_${index}`}
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        {/* ... existing nav items ... */}
      </View>
    </View>
  );
};
```

4. **Add conversationImage style**:
```javascript
conversationImage: {
  width: 60,
  height: 60,
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
  marginRight: 12,
},
listingName: {
  fontSize: 12,
  color: '#7C3AED',
  marginBottom: 2,
},
unreadBadge: {
  backgroundColor: '#7C3AED',
  width: 24,
  height: 24,
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
},
unreadCount: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '700',
},
```

5. **Add 'chat' case in renderScreen():**
```javascript
case 'chat':
  return (
    <ChatScreen
      listing={chatData?.listing}
      otherUser={chatData?.otherUser}
      currentUser={user}
      onBack={handleBack}
    />
  );
```

6. **Update ItemDetailScreen's "Send a message" button:**

In `src/screens/ItemDetailScreen.js`, update the bottom action button:

```javascript
<TouchableOpacity 
  style={styles.secondaryButton}
  onPress={() => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to send messages');
      return;
    }
    
    // Navigate to chat
    onNavigate('chat', {
      listing: {
        _id: item._id,
        title: item.title,
        imageUrl: item.imageUrl
      },
      otherUser: {
        id: item.userId,
        name: item.userName
      }
    });
  }}
>
  <Text style={styles.secondaryButtonText}>Send a message</Text>
</TouchableOpacity>
```

7. **Update the ItemDetailScreen props** to accept `onNavigate`:

Change the ItemDetailScreen call to include:
```javascript
case 'itemDetail':
  return (
    <ItemDetailScreen
      item={selectedItem}
      onBack={handleBack}
      onNavigate={(screen, data) => {
        if (screen === 'chat') {
          setChatData(data);
        }
        setCurrentScreen(screen);
      }}
      currentUserLocation={null}
      currentUser={user}
    />
  );
```

## 🚀 How It Works

### User Flow:
1. **User clicks on a food item** → ItemDetailScreen
2. **Clicks "Request" button** → Creates a request in database
3. **Clicks "Send a message"** → Opens ChatScreen
4. **Types and sends message** → Message saved to database
5. **Both users can see messages** in Messages tab
6. **Real-time updates** every 5 seconds

### Backend Flow:
1. Messages stored with sender/receiver/listing info
2. Conversations grouped by listing + other user
3. Unread count tracked automatically
4. Messages auto-marked as read when viewed

## 📝 Testing Steps

1. **Start the backend:**
```bash
cd backend
npm start
```

2. **Start the mobile app:**
```bash
npm start
```

3. **Test the feature:**
   - Login with User A
   - Click on a food item
   - Click "Send a message"
   - Send a test message
   - Login with User B (the item owner)
   - Go to Messages tab
   - See the conversation
   - Reply to the message
   - Switch back to User A
   - See the reply

## 🔑 Key Features

✅ Real-time messaging
✅ Conversation grouping by item
✅ Unread message badges
✅ Read receipts
✅ Auto-scrolling to latest message
✅ Item info banner in chat
✅ Message persistence in database
✅ Polling for new messages

## 📦 Files Modified/Created

### Created:
- `backend/models/Message.js`
- `src/screens/ChatScreen.js`
- `MESSAGE_FEATURE_SUMMARY.md`

### Modified:
- `backend/server.js` (added message endpoints)
- `src/services/api.js` (added message API calls)

### Needs Modification:
- `App.js` (integrate ChatScreen and update MessagesScreen)
- `src/screens/ItemDetailScreen.js` (make "Send a message" functional)

## 🐛 Troubleshooting

**Messages not appearing?**
- Check backend is running
- Check network requests in console
- Verify user is logged in
- Check MongoDB connection

**Can't send messages?**
- Verify authentication token
- Check console for errors
- Ensure listing and user IDs are correct

**Messages not updating?**
- Polling interval is 5 seconds
- Try manually refreshing
- Check network connection
