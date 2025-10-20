import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/api';

// Safely import MapView only on mobile
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
  } catch (e) {
    console.log('MapView not available');
  }
}

const { width } = Dimensions.get('window');

const ItemDetailScreen = ({ item, onBack, currentUserLocation, currentUser, onNavigate }) => {
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [itemStatus, setItemStatus] = useState(item?.status || 'available');

  // Safety check
  if (!item) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Item Not Found</Text>
          <View style={{width: 24}} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Item details not available</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={onBack}>
            <Text style={styles.primaryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Calculate time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const seconds = Math.floor((now - created) / 1000);
    
    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const handleRequest = async () => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to request items');
      return;
    }

    if (itemStatus !== 'available') {
      Alert.alert('Not Available', 'This item is no longer available');
      return;
    }

    Alert.prompt(
      'Request Item',
      'When can you collect this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Send Request', 
          onPress: async (pickupTime) => {
            setRequesting(true);
            try {
              await apiService.createRequest({
                listingId: item._id,
                message: `Hi! I'm interested in ${item.title}`,
                pickupTime: pickupTime || 'As soon as possible'
              });
              Alert.alert('Success!', `Your request has been sent to ${item.userName}. They will respond soon.`);
              onBack();
            } catch (error) {
              console.error('Request error:', error);
              const errorMsg = error.response?.data?.message || 'Failed to send request. Please try again.';
              Alert.alert('Error', errorMsg);
            } finally {
              setRequesting(false);
            }
          }
        }
      ],
      'plain-text',
      'Today evening'
    );
  };

  const handleMakeOffer = () => {
    Alert.alert(
      'Make an Offer',
      'Coming soon: Make an offer feature',
      [{ text: 'OK' }]
    );
  };

  const handleShare = () => {
    Alert.alert('Share', `Share "${item.title}" with friends`, [{ text: 'OK' }]);
  };

  const handleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted);
    Alert.alert(
      isWatchlisted ? 'Removed from Watchlist' : 'Added to Watchlist',
      isWatchlisted ? 'Item removed from your watchlist' : 'Item added to your watchlist'
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{item.title}</Text>
        <TouchableOpacity style={styles.flagButton}>
          <Ionicons name="flag-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View style={styles.imageContainer}>
          {item.imageUrl && (item.imageUrl.startsWith('data:image') || item.imageUrl.startsWith('http')) ? (
            <Image 
              source={{ uri: item.imageUrl }} 
              style={styles.image} 
              resizeMode="cover"
              onError={() => console.log('Image load error')}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="fast-food" size={80} color="#9CA3AF" />
            </View>
          )}

          {/* Share and Watchlist buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#000" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={handleWatchlist}>
              <Ionicons 
                name={isWatchlisted ? "star" : "star-outline"} 
                size={20} 
                color={isWatchlisted ? "#FFD700" : "#000"} 
              />
              <Text style={styles.actionText}>Watchlist</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerSection}>
          <View style={styles.sellerHeader}>
            <View style={styles.sellerAvatar}>
              <Ionicons name="person" size={24} color="#7C3AED" />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{item.userName} is selling</Text>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <View style={styles.metaInfo}>
                <Ionicons name="time-outline" size={14} color="#666" />
                <Text style={styles.metaText}>
                  Added {getTimeAgo(item.createdAt || new Date())}
                </Text>
                {item.categoryTitle && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{item.categoryTitle}</Text>
                  </>
                )}
              </View>
            </View>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FFD700" />
              <Text style={styles.ratingText}>{item.userRating || '5.0'}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionText}>
            {item.description || 'No description provided'}
          </Text>
        </View>

        {/* Pick-up times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick-up times</Text>
          <Text style={styles.sectionValue}>Negotiable</Text>
        </View>

        {/* Pick-up instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pick-up instructions</Text>
          <Text style={styles.sectionValue}>
            {item.pickupInstructions || 'Contact seller for pickup details'}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.locationHeader}>
            <Text style={styles.sectionTitle}>LOCATION</Text>
            <View style={styles.distanceBadge}>
              <Ionicons name="location" size={14} color="#7C3AED" />
              <Text style={styles.distanceText}>{item.distance || '0km'} away</Text>
            </View>
          </View>

          {/* Map */}
          {Platform.OS !== 'web' && item.latitude && item.longitude && MapView ? (
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                  latitude: item.latitude,
                  longitude: item.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
              >
                <Marker
                  coordinate={{
                    latitude: item.latitude,
                    longitude: item.longitude,
                  }}
                >
                  <View style={styles.markerCircle}>
                    <View style={styles.markerInner} />
                  </View>
                </Marker>
              </MapView>
              <TouchableOpacity style={styles.zoomButton}>
                <Ionicons name="search" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.mapPlaceholder}>
              <Ionicons name="map-outline" size={40} color="#9CA3AF" />
              <Text style={styles.placeholderText}>
                {item.locationName || 'Location not available'}
              </Text>
            </View>
          )}
        </View>

        {/* Tips section */}
        <View style={styles.tipsSection}>
          <Text style={styles.tipsIcon}>💡</Text>
          <Text style={styles.tipsTitle}>Tips for buying on Olio</Text>
          <Text style={styles.tipsText}>• Send a sensible offer and include when you're able to collect the item</Text>
          <Text style={styles.tipsText}>• Pay on collection once you've seen the item</Text>
          <Text style={styles.tipsText}>• If anything seems suspicious let us know</Text>
          <TouchableOpacity>
            <Text style={styles.guideLink}>📖 Full guide: buying and selling</Text>
          </TouchableOpacity>
        </View>

        {/* Advertisement placeholder */}
        <View style={styles.adSection}>
          <Text style={styles.adLabel}>Advertisement</Text>
          <View style={styles.adPlaceholder}>
            <Text style={styles.adText}>Ad space</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.bottomActions}>
        {itemStatus === 'reserved' ? (
          <View style={styles.reservedBanner}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
            <Text style={styles.reservedText}>Reserved - Will be removed soon</Text>
          </View>
        ) : item.price ? (
          <TouchableOpacity style={styles.primaryButton} onPress={handleMakeOffer} disabled={requesting}>
            <Text style={styles.primaryButtonText}>Make an offer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.primaryButton, requesting && styles.disabledButton]} 
            onPress={handleRequest}
            disabled={requesting}
          >
            <Text style={styles.primaryButtonText}>
              {requesting ? 'Sending...' : 'Request'}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => {
            if (!currentUser) {
              Alert.alert('Login Required', 'Please login to send messages');
              return;
            }
            
            // Navigate to chat
            if (onNavigate) {
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
            } else {
              Alert.alert('Coming Soon', 'Messaging feature will be available soon!');
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>Send a message</Text>
        </TouchableOpacity>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginHorizontal: 16,
  },
  flagButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtons: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  sellerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sellerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  metaDot: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 6,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginLeft: 2,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  descriptionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    marginLeft: 4,
  },
  mapContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  markerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#7C3AED',
    borderWidth: 3,
    borderColor: '#fff',
  },
  zoomButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  tipsSection: {
    backgroundColor: '#F0F9FF',
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  tipsIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  tipsText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 6,
  },
  guideLink: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
    marginTop: 8,
  },
  adSection: {
    padding: 16,
  },
  adLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  adPlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  bottomActions: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryButton: {
    backgroundColor: '#4A1D70',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: '#4A1D70',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  reservedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 12,
  },
  reservedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default ItemDetailScreen;
