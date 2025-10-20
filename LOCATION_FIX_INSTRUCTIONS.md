# 📍 Fix: Wrong Location on Map

## Problem
When adding food, markers show in random/wrong locations because listings don't have real GPS coordinates.

## Solution
Auto-detect GPS location when adding an item.

## Quick Fix

Find the `AddListingScreen` component in `App.js` (around line 1250) and make these changes:

### 1. Add Location State (Line ~1255)
```javascript
const [formData, setFormData] = useState({
  title: '',
  description: '',
  category: category?.id || 'free-non-food',
  categoryTitle: category?.title || 'Free non-food',
  quantity: '1',
  location: user?.location || '',
  imageUrl: '',
  latitude: null,      // ADD THIS
  longitude: null,     // ADD THIS
});
const [detectingLocation, setDetectingLocation] = useState(false); // ADD THIS
```

### 2. Add Location Detection Function (After pickImage function)
```javascript
// Detect current location
const detectCurrentLocation = async () => {
  try {
    setDetectingLocation(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Location Permission', 'Location permission is needed to show your item on the map');
      return;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    // Get address from coordinates
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

    console.log('Location detected:', {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
      name: locationName
    });
  } catch (error) {
    console.error('Error detecting location:', error);
    Alert.alert('Location Error', 'Could not detect your location. You can enter it manually.');
  } finally {
    setDetectingLocation(false);
  }
};
```

### 3. Call Location Detection on Mount (Update useEffect)
```javascript
useEffect(() => {
  (async () => {
    // Request media permissions
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please allow access to your photos to upload images.');
      }
    }
    
    // ADD THIS: Auto-detect location
    await detectCurrentLocation();
  })();
}, []);
```

### 4. Include Coordinates When Submitting (Update handleAddListing)

Find this line in `handleAddListing`:
```javascript
const listingData = {
  title: formData.title,
  description: formData.description,
  category: formData.category,
  categoryTitle: formData.categoryTitle,
  quantity: formData.quantity,
  locationName: formData.location || 'Not specified',
  imageUrl: selectedImages.length > 0 ? selectedImages[0] : `https://picsum.photos/seed/${Date.now()}/400/400`,
  userRating: '5.0',
  distance: '0km'
};
```

Change it to:
```javascript
// Validate location FIRST
if (!formData.latitude || !formData.longitude) {
  Alert.alert('Location Required', 'Please wait for location detection or enable location services');
  return;
}

const listingData = {
  title: formData.title,
  description: formData.description,
  category: formData.category,
  categoryTitle: formData.categoryTitle,
  quantity: formData.quantity,
  locationName: formData.location || 'Not specified',
  imageUrl: selectedImages.length > 0 ? selectedImages[0] : `https://picsum.photos/seed/${Date.now()}/400/400`,
  latitude: formData.latitude,    // ADD THIS
  longitude: formData.longitude,  // ADD THIS
  userRating: '5.0',
  distance: '0km'
};
```

### 5. Add Location Button in UI (After Location TextInput)

Find the location input section and replace it with:
```javascript
<Text style={styles.sectionLabel}>Location</Text>
<View style={styles.locationInputContainer}>
  <TextInput
    style={[styles.input, {flex: 1}]}
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
{formData.latitude && formData.longitude && (
  <Text style={styles.coordsText}>
    📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
  </Text>
)}
{!formData.latitude && !detectingLocation && (
  <Text style={styles.locationWarning}>
    ⚠️ Location not detected. Tap the location icon to try again.
  </Text>
)}
```

### 6. Add Styles (At end of StyleSheet.create)
```javascript
locationInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 10,
},
detectLocationButton: {
  padding: 10,
  backgroundColor: '#F3F4F6',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#D1D5DB',
},
coordsText: {
  fontSize: 12,
  color: '#10B981',
  marginTop: 5,
  fontWeight: '600',
},
locationWarning: {
  fontSize: 12,
  color: '#EF4444',
  marginTop: 5,
},
```

## Result

Now when adding food:
1. ✅ Auto-detects GPS location on form load
2. ✅ Shows location name (e.g., "Main Street, London")
3. ✅ Shows coordinates for verification
4. ✅ Manual locate button if it fails
5. ✅ Prevents submission without location
6. ✅ Marker appears at EXACT location on map

## Test It

1. Go to "Free food" → "Add an item"
2. Wait for "Detecting location..." → Should show your area
3. See coordinates below location field
4. Fill form and submit
5. Go to Explore → Map
6. ✅ Marker should be at YOUR EXACT LOCATION!

That's it! Your markers will now show in the correct location! 📍
