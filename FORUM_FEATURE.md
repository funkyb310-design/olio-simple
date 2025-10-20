# Forum Feature Implementation

Add this code to App.js:

## 1. Add CreatePostScreen (before CommunityScreen):

```javascript
// Create Post Screen
const CreatePostScreen = ({ onBack, user }) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Olio Love');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const categories = ['Olio Love', 'App Q&A', 'Recipe Share', 'Spreading The Word', 'Other'];

  const pickImage = async () => {
    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    } finally {
      setUploading(false);
    }
  };

  const handlePublish = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something');
      return;
    }

    setLoading(true);
    try {
      const newPost = {
        user: user?.firstName || 'User',
        content: content,
        category: category,
        image: selectedImage,
        time: 'Just now',
        likes: 0,
        comments: 0
      };
      
      console.log('Creating post:', newPost);
      
      Alert.alert('Success', 'Post published successfully!', [
        { text: 'OK', onPress: () => onBack('community') }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to publish post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.exploreHeader}>
        <TouchableOpacity onPress={() => onBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.exploreTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePublish}
          disabled={loading || !content.trim()}
        >
          <Text style={[styles.publishText, (!content.trim() || loading) && {color: '#ccc'}]}>
            {loading ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.createPostContent}>
        <View style={styles.postUserSection}>
          <View style={styles.postUserAvatar}>
            <Ionicons name="person" size={30} color="#7C3AED" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.postUserName}>{user?.firstName || 'User'}</Text>
            <Text style={styles.postUserSubtext}>Posting to {category}</Text>
          </View>
        </View>

        <View style={styles.categorySelectorSection}>
          <Text style={styles.sectionLabel}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  category === cat && styles.categoryChipActive
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat && styles.categoryChipTextActive
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.postContentSection}>
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />
        </View>

        {selectedImage && (
          <View style={styles.postImagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.postPreviewImage} />
            <TouchableOpacity 
              style={styles.removePostImage}
              onPress={() => setSelectedImage(null)}
            >
              <Ionicons name="close-circle" size={28} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          style={styles.addPhotoButton}
          onPress={pickImage}
          disabled={uploading}
        >
          <Ionicons name="camera" size={24} color="#7C3AED" />
          <Text style={styles.addPhotoText}>
            {uploading ? 'Loading...' : selectedImage ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
```

## 2. Add case 'createPost' in renderScreen():

```javascript
case 'createPost':
  return (
    <CreatePostScreen
      user={user}
      onBack={(screen) => setCurrentScreen(screen || 'home')}
    />
  );
```

## 3. Add styles at the end of StyleSheet.create:

```javascript
createPostContent: {
  flex: 1,
  backgroundColor: '#fff',
},
postUserSection: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
postUserAvatar: {
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: '#F3E8FF',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 12,
},
postUserName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#000',
},
postUserSubtext: {
  fontSize: 14,
  color: '#666',
  marginTop: 2,
},
categorySelectorSection: {
  padding: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
categoryChip: {
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: '#D1D5DB',
  marginRight: 8,
  backgroundColor: '#fff',
},
categoryChipActive: {
  backgroundColor: '#7C3AED',
  borderColor: '#7C3AED',
},
categoryChipText: {
  fontSize: 14,
  color: '#666',
},
categoryChipTextActive: {
  color: '#fff',
  fontWeight: '600',
},
postContentSection: {
  padding: 20,
  minHeight: 200,
},
postInput: {
  fontSize: 16,
  color: '#000',
  textAlignVertical: 'top',
  minHeight: 150,
},
postImagePreview: {
  margin: 20,
  position: 'relative',
},
postPreviewImage: {
  width: '100%',
  height: 250,
  borderRadius: 12,
},
removePostImage: {
  position: 'absolute',
  top: 8,
  right: 8,
  backgroundColor: 'rgba(255,255,255,0.9)',
  borderRadius: 14,
},
addPhotoButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  padding: 16,
  margin: 20,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#7C3AED',
  borderStyle: 'dashed',
  backgroundColor: '#F9FAFB',
},
addPhotoText: {
  marginLeft: 8,
  fontSize: 16,
  color: '#7C3AED',
  fontWeight: '600',
},
publishText: {
  fontSize: 16,
  color: '#7C3AED',
  fontWeight: '600',
},
```

## 4. Update bottom nav + button to show options:

Replace all 5 instances of:
```javascript
<TouchableOpacity style={styles.navItem} onPress={() => onNavigate('add')}>
```

With:
```javascript
<TouchableOpacity style={styles.navItem} onPress={() => {
  Alert.alert(
    '➕ Add',
    'What would you like to add?',
    [
      { text: '🎁 Free Item', onPress: () => onNavigate('add') },
      { text: '💬 Forum Post', onPress: () => onNavigate('createPost') },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
}}>
```

This will add forum post creation feature!
