// ============================================
// FIXED Add Listing Screen Component
// WITH AUTO GPS LOCATION DETECTION
// ============================================
// Copy this entire component and REPLACE the existing AddListingScreen in App.js

// Add Listing Screen - FIXED VERSION
const AddListingScreen = ({ onBack, user, category }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: category?.id || 'free-non-food',
    categoryTitle: category?.title || 'Free non-food',
    quantity: '1',
    location: user?.location || '',
    imageUrl: '',
    latitude: null,      // ✅ NEW: Store GPS latitude
    longitude: null,     // ✅ NEW: Store GPS longitude
  });
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false); // ✅ NEW: Location detection state

  // Request permissions and detect location on mount
  useEffect(() => {
    (async () => {
      // Request media permissions
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please allow access to your photos to upload images.');
        }
      }
      
      // ✅ NEW: Auto-detect location when form opens
      await detectCurrentLocation();
    })();
  }, []);

  // ✅ NEW: Detect current GPS location
  const detectCurrentLocation = async () => {
    try {
      setDetectingLocation(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission', 
          'Location permission is needed to show your item on the map.\n\nYou can still add items, but they won\'t appear in the correct location.'
        );
        return;
      }

      console.log('Getting GPS location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log('GPS coords:', location.coords.latitude, location.coords.longitude);

      // Get human-readable address from coordinates
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationName = address.street || address.district || address.city || address.region || 'Current Location';

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        location: locationName,
      }));

      console.log('✅ Location detected:', {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
        name: locationName
      });
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert(
        'Location Error', 
        'Could not detect your location automatically. You can enter it manually or try again.'
      );
    } finally {
      setDetectingLocation(false);
    }
  };

  // Convert image to base64
  const convertToBase64 = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
        reader.onerror = (error) => {
          console.error('FileReader error:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image:', error);
      return uri;
    }
  };

  const pickImage = async () => {
    try {
      if (selectedImages.length >= 10) {
        Alert.alert('Limit Reached', 'You can only upload up to 10 images');
        return;
      }

      setUploadingImage(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        let imageData;
        if (asset.base64) {
          imageData = `data:image/jpeg;base64,${asset.base64}`;
        } else {
          imageData = await convertToBase64(asset.uri);
        }
        
        const newImages = [...selectedImages, imageData];
        setSelectedImages(newImages);
        
        if (!formData.imageUrl) {
          setFormData({...formData, imageUrl: imageData});
        }
        
        console.log('Image added successfully, size:', imageData.length);
        Alert.alert('Success', 'Image added!');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    
    if (index === 0 && newImages.length > 0) {
      setFormData({...formData, imageUrl: newImages[0]});
    } else if (newImages.length === 0) {
      setFormData({...formData, imageUrl: ''});
    }
  };

  const handleAddListing = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // ✅ NEW: Validate GPS coordinates exist
    if (!formData.latitude || !formData.longitude) {
      Alert.alert(
        'Location Required', 
        'Please wait for location detection to complete, or tap the location button to try again.\n\nWithout GPS coordinates, your item won\'t appear correctly on the map.'
      );
      return;
    }

    setLoading(true);
    try {
      console.log('Creating listing with data:', {
        title: formData.title,
        category: formData.category,
        categoryTitle: formData.categoryTitle,
        latitude: formData.latitude,
        longitude: formData.longitude,
      });

      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        categoryTitle: formData.categoryTitle,
        quantity: formData.quantity,
        locationName: formData.location || 'Not specified',
        imageUrl: selectedImages.length > 0 ? selectedImages[0] : `https://picsum.photos/seed/${Date.now()}/400/400`,
        latitude: formData.latitude,      // ✅ NEW: Include GPS latitude
        longitude: formData.longitude,    // ✅ NEW: Include GPS longitude
        userRating: '5.0',
        distance: '0km'
      };

      const result = await apiService.createListing(listingData);
      console.log('✅ Listing created successfully:', result);
      
      Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => onBack() }
      ]);
    } catch (error) {
      console.error('FULL Error creating listing:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create listing';
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'You must be logged in to create a listing. Please login again.';
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
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.exploreHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.exploreTitle}>Add Listing</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.addListingContent}>
        {/* Image Upload Section */}
        <Text style={styles.sectionLabel}>Images (up to 10)</Text>
        <View style={styles.imageUploadSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((imageUri, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}
                >
                  <Ionicons name="close-circle" size={24} color="#EF4444" />
                </TouchableOpacity>
                {index === 0 && (
                  <View style={styles.mainImageBadge}>
                    <Text style={styles.mainImageText}>Main</Text>
                  </View>
                )}
              </View>
            ))}
            
            {selectedImages.length < 10 && (
              <TouchableOpacity 
                style={styles.addImageButton}
                onPress={pickImage}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <ActivityIndicator size="small" color="#7C3AED" />
                    <Text style={styles.addImageText}>Processing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="camera" size={32} color="#7C3AED" />
                    <Text style={styles.addImageText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        <Text style={styles.sectionLabel}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="What are you giving away?"
          placeholderTextColor="#999"
          value={formData.title}
          onChangeText={(text) => setFormData({...formData, title: text})}
        />

        <Text style={styles.sectionLabel}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your item..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          value={formData.description}
          onChangeText={(text) => setFormData({...formData, description: text})}
        />

        <Text style={styles.sectionLabel}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., 1, 2, 500g"
          placeholderTextColor="#999"
          value={formData.quantity}
          onChangeText={(text) => setFormData({...formData, quantity: text})}
        />

        <Text style={styles.sectionLabel}>Category</Text>
        <View style={[styles.input, {backgroundColor: '#F3F4F6'}]}>
          <Text style={{color: '#000', fontSize: 16}}>{formData.categoryTitle}</Text>
        </View>

        {/* ✅ NEW: Enhanced Location Section with GPS Detection */}
        <Text style={styles.sectionLabel}>Location *</Text>
        <View style={styles.locationInputContainer}>
          <TextInput
            style={[styles.input, {flex: 1, marginBottom: 0}]}
            placeholder="Detecting location..."
            placeholderTextColor="#999"
            value={formData.location}
            onChangeText={(text) => setFormData({...formData, location: text})}
            editable={!detectingLocation}
          />
          <TouchableOpacity 
            style={styles.detectLocationButton}
            onPress={detectCurrentLocation}
            disabled={detectingLocation}
          >
            {detectingLocation ? (
              <ActivityIndicator size="small" color="#7C3AED" />
            ) : (
              <Ionicons name="locate" size={24} color="#7C3AED" />
            )}
          </TouchableOpacity>
        </View>
        
        {/* ✅ NEW: Show GPS coordinates when detected */}
        {formData.latitude && formData.longitude && (
          <View style={styles.locationSuccessContainer}>
            <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            <Text style={styles.coordsText}>
              GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        
        {/* ✅ NEW: Warning if no GPS coordinates */}
        {!formData.latitude && !detectingLocation && (
          <View style={styles.locationWarningContainer}>
            <Ionicons name="warning" size={16} color="#EF4444" />
            <Text style={styles.locationWarning}>
              Location not detected. Tap 📍 to try again.
            </Text>
          </View>
        )}

        {/* ✅ UPDATED: Disable publish button if no GPS coordinates */}
        <TouchableOpacity 
          style={[
            styles.publishButton, 
            (loading || detectingLocation || !formData.latitude) && styles.disabledButton
          ]}
          onPress={handleAddListing}
          disabled={loading || detectingLocation || !formData.latitude}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : detectingLocation ? (
            <Text style={styles.publishButtonText}>Detecting Location...</Text>
          ) : !formData.latitude ? (
            <Text style={styles.publishButtonText}>Waiting for Location...</Text>
          ) : (
            <Text style={styles.publishButtonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// ============================================
// ADD THESE NEW STYLES TO YOUR StyleSheet.create
// ============================================
// Add these inside your styles object:

/*
locationInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 10,
},
detectLocationButton: {
  padding: 12,
  backgroundColor: '#F3F4F6',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#D1D5DB',
  marginLeft: 10,
  justifyContent: 'center',
  alignItems: 'center',
},
locationSuccessContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#D1FAE5',
  padding: 8,
  borderRadius: 6,
  marginTop: 5,
},
coordsText: {
  fontSize: 11,
  color: '#059669',
  marginLeft: 6,
  fontWeight: '600',
},
locationWarningContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FEE2E2',
  padding: 8,
  borderRadius: 6,
  marginTop: 5,
},
locationWarning: {
  fontSize: 12,
  color: '#DC2626',
  marginLeft: 6,
  fontWeight: '500',
},
*/
