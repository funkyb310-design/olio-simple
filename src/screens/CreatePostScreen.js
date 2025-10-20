import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

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
      const postData = {
        content: content,
        category: category,
        image: selectedImage || ''
      };
      
      console.log('Creating post:', postData);
      
      const result = await apiService.createPost(postData);
      console.log('Post created successfully:', result);
      
      Alert.alert('Success', 'Post published successfully!', [
        { text: 'OK', onPress: () => onBack('community') }
      ]);
    } catch (error) {
      console.error('Create post error:', error);
      let errorMessage = 'Failed to publish post';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You must be logged in to create a post. Please login again.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Post</Text>
        <TouchableOpacity 
          onPress={handlePublish}
          disabled={loading || !content.trim()}
        >
          <Text style={[styles.publishText, (!content.trim() || loading) && {color: '#ccc'}]}>
            {loading ? 'Publishing...' : 'Publish'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userSection}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={30} color="#7C3AED" />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.userName}>{user?.firstName || 'User'}</Text>
            <Text style={styles.userSubtext}>Posting to {category}</Text>
          </View>
        </View>

        <View style={styles.categorySection}>
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

        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#999"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />
        </View>

        {selectedImage && (
          <View style={styles.imagePreview}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />
            <TouchableOpacity 
              style={styles.removeImage}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    padding: 4,
  },
  publishText: {
    fontSize: 16,
    color: '#7C3AED',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  userSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  categorySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
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
  inputSection: {
    padding: 20,
    minHeight: 200,
  },
  textInput: {
    fontSize: 16,
    color: '#000',
    textAlignVertical: 'top',
    minHeight: 150,
  },
  imagePreview: {
    margin: 20,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
  },
  removeImage: {
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
});

export default CreatePostScreen;
