import React, { useState, useEffect, Component } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
  Platform,
  Image,
  FlatList,
  ActivityIndicator,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
// Only import MapView on mobile (not web)
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}
import {
  Feather,
  MaterialIcons,
  FontAwesome5,
  AntDesign,
  Ionicons,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import { apiService } from './src/services/api';
import CreatePostScreen from './src/screens/CreatePostScreen';
import ItemDetailScreen from './src/screens/ItemDetailScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import ChatScreen from './src/screens/ChatScreen';

// Safely get dimensions
let width = 375;
let height = 667;
try {
  const dims = Dimensions.get('window');
  width = dims.width;
  height = dims.height;
} catch (error) {
  console.log('Using default dimensions');
}

// API Base URL - Using your PC's IP address
const API_BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000/api'
  : 'http://172.20.10.11:3000/api'; // Your PC's IP address

// Mock data
let mockListings = [
  {
    _id: '1',
    title: 'Free New Ice cube tray',
    description: 'Brand new silicone ice cube tray, never used',
    category: 'free-non-food',
    categoryTitle: 'Free non-food',
    quantity: '1',
    locationName: 'Camden Town',
    imageUrl: 'https://picsum.photos/300/300',
    userId: 'user1@test.com',
    userName: 'Rosie',
    userRating: '5.0',
    distance: '18.5km',
    price: null,
    createdAt: new Date(),
    latitude: 51.5390,
    longitude: -0.1426
  },
  {
    _id: '2', 
    title: 'Free New Silicone baking tray',
    description: 'Never used baking tray, perfect condition',
    category: 'free-non-food',
    categoryTitle: 'Free non-food', 
    quantity: '1',
    locationName: 'Islington',
    imageUrl: 'https://picsum.photos/301/301',
    userId: 'user2@test.com',
    userName: 'Rosie',
    userRating: '5.0',
    distance: '18.5km',
    price: null,
    createdAt: new Date(),
    latitude: 51.5360,
    longitude: -0.1030
  }
];

const mockMessages = [
  {
    _id: '1',
    from: 'Rosie',
    message: 'Hi! Is the ice cube tray still available?',
    time: '2 hours ago',
    unread: true
  }
];

const mockForumPosts = [
  {
    _id: '1',
    user: 'Karen',
    content: 'Look what I picked up in the Reduced Food section!',
    category: 'Spreading The Word',
    time: '9 hours ago',
    likes: 8,
    comments: 1,
    userPhoto: 'https://picsum.photos/100/100'
  }
];

// Welcome Screen
const WelcomeScreen = ({ onSignUp, onLogin }) => (
  <View style={styles.welcomeContainer}>
    <StatusBar barStyle="light-content" />
    <View style={styles.welcomeContent}>
      <Text style={styles.welcomeTitle}>olio</Text>
      <Text style={styles.welcomeSubtitle}>
        Give it away and{"\n"}make someone's day
      </Text>
    </View>
    <View style={styles.welcomeButtons}>
      <TouchableOpacity style={styles.signUpButton} onPress={onSignUp}>
        <Text style={styles.signUpButtonText}>Sign up</Text>
      </TouchableOpacity>
      
      <View style={styles.loginPrompt}>
        <Text style={styles.loginPromptText}>Already have an account? </Text>
        <TouchableOpacity onPress={onLogin} style={styles.loginLink}>
          <Text style={styles.loginLinkText}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

// Login Screen
const LoginScreen = ({ onLogin, onBack, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMagicLink, setShowMagicLink] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }
    onLogin(email, password);
  };

  return (
    <View style={styles.authContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.authHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.authTitle}>Login</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.authContent} contentContainerStyle={{paddingBottom: 40}}>
        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.inputField}
          placeholder=""
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        {!showMagicLink ? (
          <>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Ionicons name="eye-off-outline" size={20} color="#999" />
            </View>

            <TouchableOpacity style={{marginTop: 10}}>
              <Text style={styles.linkText}>Forgotten password?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.purpleButton, {marginTop: 'auto'}, isLoading && styles.disabledButton]} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.purpleButtonText}>Login now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={{alignItems: 'center', marginTop: 20}}
              onPress={() => setShowMagicLink(true)}
            >
              <Text style={styles.linkText}>Or login via a magic link</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={{color: '#666', fontSize: 14, marginTop: 10, marginBottom: 30}}>
              If you signed up previously via Facebook, use that email
            </Text>

            <TouchableOpacity 
              style={[styles.purpleButton, isLoading && styles.disabledButton]}
              disabled={isLoading}
            >
              <Text style={styles.purpleButtonText}>Login via a magic link</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{alignItems: 'center', marginTop: 20}}
              onPress={() => setShowMagicLink(false)}
            >
              <Text style={styles.linkText}>Or login via password</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

// Register Screen
const RegisterScreen = ({ onRegister, onBack, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!email || !password || !firstName || !lastName) {
        setError('All fields are required');
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters');
        return;
      }

      if (!agreedToTerms) {
        setError('Please agree to terms and conditions');
        return;
      }

      await onRegister({ email, password, firstName, lastName });
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <View style={styles.authContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.authHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.authTitle}>Join Olio</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.authContent} contentContainerStyle={{paddingBottom: 40}}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Text style={styles.inputLabel}>First name (display name)</Text>
        <TextInput
          style={styles.inputField}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>Last name</Text>
        <TextInput
          style={styles.inputField}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />

        <Text style={styles.inputLabel}>Email</Text>
        <TextInput
          style={styles.inputField}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.inputLabel}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="8+ characters"
            placeholderTextColor="#999"
          />
          <Ionicons name="eye-off-outline" size={20} color="#999" />
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={() => setAgreedToTerms(!agreedToTerms)}
        >
          <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
            {agreedToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
          <Text style={styles.checkboxText}>
            I agree to Olio's <Text style={styles.linkText}>terms and conditions</Text>,{' '}
            <Text style={styles.linkText}>privacy policy</Text> and{' '}
            <Text style={styles.linkText}>end user licence agreement</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.purpleButton, isLoading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.purpleButtonText}>
            {isLoading ? 'Creating...' : 'Join now'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={{alignItems: 'center', marginTop: 20}}>
          <Text style={styles.linkText}>Or join via a magic email link</Text>
        </TouchableOpacity>

        <View style={{alignItems: 'center', marginTop: 30}}>
          <Text style={{color: '#666'}}>
            Having a problem? <Text style={styles.linkText}>Contact us</Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Category data
const categories = [
  {
    id: 'free-food',
    title: 'Free food',
    description: 'Give away free food',
    icon: '🍎',
    color: '#A7F3D0',
  },
  {
    id: 'free-non-food',
    title: 'Free non-food',
    description: 'Give away free non-food items',
    icon: '🎁',
    color: '#E0E7FF',
  },
  {
    id: 'for-sale',
    title: 'For sale',
    description: 'Sell non-food items',
    icon: '🏷️',
    color: '#FBCFE8',
  },
  {
    id: 'borrow',
    title: 'Borrow',
    description: 'Lend your things to people locally',
    icon: '🤝',
    color: '#CFFAFE',
  },
  {
    id: 'wanted',
    title: 'Wanted',
    description: 'Ask for something',
    icon: '✨',
    color: '#FCD34D',
  }
];

// Category Card Component
const CategoryCard = ({ title, description, icon, color, onPress }) => (
  <TouchableOpacity style={[styles.categoryCardNew, { backgroundColor: color }]} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <Text style={styles.categoryIcon}>{icon}</Text>
    </View>
    <View style={styles.categoryContent}>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryDescription}>{description}</Text>
    </View>
    <Feather name="chevron-right" size={20} color="#4B5563" />
  </TouchableOpacity>
);

// Menu Screen Component
const MenuScreen = ({ user, onClose, onNavigate, onLogout }) => (
  <Modal
    visible={true}
    animationType="slide"
    transparent={false}
    onRequestClose={onClose}
  >
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.menuHeader}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.menuHeaderTitle}>Menu</Text>
        <View style={{width: 28}} />
      </View>

      <ScrollView style={styles.menuContent}>
        {/* User Profile Section */}
        <View style={styles.menuProfileSection}>
          <View style={styles.menuProfileAvatar}>
            <Ionicons name="person" size={40} color="#7C3AED" />
          </View>
          <Text style={styles.menuProfileName}>{user?.firstName || 'User'}</Text>
          <TouchableOpacity style={styles.supporterButton}>
            <Ionicons name="heart" size={16} color="#fff" />
            <Text style={styles.supporterButtonText}>Become a Supporter</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>ACTIVITY</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="star-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>My Watchlist</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="list-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>My Listings</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>SETTINGS</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => { onClose(); onNavigate('profile'); }}>
            <Ionicons name="person-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Profile</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="notifications-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Ionicons name="help-circle-outline" size={20} color="#666" />
            <Text style={styles.menuItemText}>Help Centre</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" style={{marginLeft: 'auto'}} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  </Modal>
);

// Home Screen
const HomeScreen = ({ user, onNavigate, onOpenMenu, onLogout, onSelectItem }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [location, setLocation] = useState('Winchester Street');
  const [distance, setDistance] = useState('25km');

  useEffect(() => {
    loadListings();
    getCurrentLocation();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadListings();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      let [address] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      });
      
      const locationName = address.street || address.name || address.district || address.city || 'Your Location';
      setLocation(locationName);
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

      const loadListings = async () => {
    try {
      const listingsData = await apiService.getListings();
      console.log('Loaded listings:', listingsData);
      setListings(listingsData.length > 0 ? listingsData : mockListings);
    } catch (error) {
      console.error('Get listings error:', error);
      setListings(mockListings);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.fullContainer}>
            <StatusBar barStyle="dark-content" />
      
      {/* Show Menu Modal */}
      {showMenu && (
        <MenuScreen
          user={user}
          onClose={() => setShowMenu(false)}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      )}
      
            <View style={styles.homeHeader}>
        <View style={{flex: 1}}>
          <Text style={styles.greetingText}>Good afternoon, {user?.firstName || 'Thamem'}</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={getCurrentLocation}>
            <Ionicons name="location-outline" size={16} color="#000" />
            <Text style={styles.locationText}>{location}</Text>
            <Feather name="chevron-down" size={16} color="#666" />
          </TouchableOpacity>
          <Text style={styles.locationSubtext}>Listings within {distance}</Text>
        </View>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity style={styles.iconButton} onPress={() => onNavigate('requests')}>
            <Ionicons name="mail-outline" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => setShowMenu(true)}>
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

            <ScrollView style={styles.homeContent}>
        <View style={styles.getStartedSection}>
          <Text style={styles.sectionTitle}>Get started</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.getStartedCard}>
              <View style={styles.emojiCircle}>
                <Text style={styles.getStartedEmoji}>👀</Text>
              </View>
              <Text style={styles.getStartedText}>See something{"\n"}you like?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.getStartedCard}>
              <View style={styles.emojiCircle}>
                <Text style={styles.getStartedEmoji}>👀</Text>
              </View>
              <Text style={styles.getStartedText}>Wait... I can{"\n"}give that away?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.getStartedCard}>
              <View style={styles.emojiCircle}>
                <Text style={styles.getStartedEmoji}>🎉</Text>
              </View>
              <Text style={styles.getStartedText}>3 things you{"\n"}might not know</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.foodSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New reduced food near you</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>All ›</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
                                                {listings.map((item) => (
              <TouchableOpacity 
                key={item._id} 
                style={styles.foodCard}
                onPress={() => {
                  if (onSelectItem) onSelectItem(item);
                  onNavigate('itemDetail');
                }}
              >
                <View style={styles.foodImageContainer}>
                                                                                                            {item.imageUrl && (item.imageUrl.startsWith('data:image') || item.imageUrl.startsWith('http')) ? (
                    <Image 
                      source={{ uri: item.imageUrl }} 
                      style={styles.foodImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Image error:', item._id)}
                    />
                  ) : (
                    <View style={[styles.foodImage, styles.imagePlaceholder]}>
                      <Ionicons name="fast-food" size={40} color="#9CA3AF" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.favoriteIcon}>
                    <Ionicons name="star-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.userInfoRow}>
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={12} color="#7C3AED" />
                    </View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.userRating}>⭐ {item.userRating}</Text>
                  </View>
                  <View style={styles.distanceRow}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    <Text style={styles.foodDistance}>{item.distance}</Text>
                  </View>
                  <Text style={styles.foodTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.foodLocation}>{item.locationName}</Text>
                  {item.price && (
                    <View style={styles.priceRow}>
                      <Text style={styles.oldPrice}>£{item.price}</Text>
                      <Text style={styles.newPrice}>£{(item.price * 0.5).toFixed(2)}</Text>
                      <Text style={styles.discount}>-50%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

                <View style={styles.foodSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>New free food</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>All ›</Text>
            </TouchableOpacity>
          </View>
          
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 10}}>
                        {mockListings.map((item) => (
              <TouchableOpacity 
                key={item._id} 
                style={styles.foodCard}
                onPress={() => {
                  if (onSelectItem) onSelectItem(item);
                  onNavigate('itemDetail');
                }}
              >
                <View style={styles.foodImageContainer}>
                  <Image 
                    source={{ uri: item.imageUrl }} 
                    style={styles.foodImage}
                    resizeMode="cover"
                  />
                  <View style={styles.freeBadge}>
                    <Text style={styles.freeBadgeText}>Free</Text>
                  </View>
                  <TouchableOpacity style={styles.favoriteIcon}>
                    <Ionicons name="star-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.userInfoRow}>
                    <View style={styles.userAvatar}>
                      <Ionicons name="person" size={12} color="#7C3AED" />
                    </View>
                    <Text style={styles.userName}>{item.userName}</Text>
                    <Text style={styles.userRating}>⭐ {item.userRating}</Text>
                  </View>
                  <View style={styles.distanceRow}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    <Text style={styles.foodDistance}>{item.distance}</Text>
                  </View>
                  <Text style={styles.foodTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.foodLocation}>{item.locationName}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

                {/* Category Cards Section - Grid Layout */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse by category</Text>
          <View style={styles.categoryGrid}>
            {/* First Row - 2 cards */}
            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#A7F3D0' }]}
              onPress={() => onNavigate('category', categories[0])}
            >
              <Text style={styles.categoryCardIcon}>🍎</Text>
              <Text style={styles.categoryCardTitle}>Free food</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#E0E7FF' }]}
              onPress={() => onNavigate('category', categories[1])}
            >
              <Text style={styles.categoryCardIcon}>🎁</Text>
              <Text style={styles.categoryCardTitle}>Free non-food</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.categoryGrid}>
            {/* Second Row - 2 cards */}
            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#FBCFE8' }]}
              onPress={() => onNavigate('category', categories[2])}
            >
              <Text style={styles.categoryCardIcon}>🏷️</Text>
              <Text style={styles.categoryCardTitle}>For sale</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.categoryCard, { backgroundColor: '#CFFAFE' }]}
              onPress={() => onNavigate('category', categories[3])}
            >
              <Text style={styles.categoryCardIcon}>🤝</Text>
              <Text style={styles.categoryCardTitle}>Borrow</Text>
            </TouchableOpacity>
          </View>
          
          {/* Third Row - Full width card */}
          <TouchableOpacity 
            style={[styles.categoryCardFull, { backgroundColor: '#FCD34D' }]}
            onPress={() => onNavigate('category', categories[4])}
          >
            <Text style={styles.categoryCardIcon}>✨</Text>
            <Text style={styles.categoryCardTitle}>Wanted</Text>
          </TouchableOpacity>
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <TouchableOpacity style={styles.helpButton}>
            <Text style={styles.helpButtonText}>Help! What can I add?</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#7C3AED" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('explore')}>
          <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        
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
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('community')}>
          <Ionicons name="people-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messages')}>
          <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance.toFixed(1);
};

// Explore Screen
const ExploreScreen = ({ onBack, onNavigate, onSelectItem }) => {
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMapView, setIsMapView] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapRegion, setMapRegion] = useState({
    latitude: 51.5074,
    longitude: -0.1278,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [maxDistance, setMaxDistance] = useState(25); // in km
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, nearest
  const [selectedTypes, setSelectedTypes] = useState([]); // filter by category
  const [showFilters, setShowFilters] = useState(false);
  const mapRef = React.useRef(null);

  useEffect(() => {
    loadListings();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (listings.length > 0 && currentLocation) {
      applyFilters();
    }
  }, [listings, currentLocation, maxDistance, sortBy, selectedTypes]);

    const getUserLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Needed', 'Location permission is required to show nearby items');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setMapRegion(newRegion);
      
      // Animate to user location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

              const applyFilters = () => {
    let filtered = [...listings];

    // Filter by distance
    if (currentLocation) {
      filtered = filtered.map(listing => {
        const distance = calculateDistance(
          currentLocation.latitude,
          currentLocation.longitude,
          listing.latitude,
          listing.longitude
        );
        return { ...listing, distance: `${distance}km` };
      }).filter(listing => {
        const distanceNum = parseFloat(listing.distance);
        return distanceNum <= maxDistance;
      });
    }

    // Filter by type/category
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(listing => 
        selectedTypes.includes(listing.category)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'nearest' && currentLocation) {
      filtered.sort((a, b) => {
        const distA = parseFloat(a.distance);
        const distB = parseFloat(b.distance);
        return distA - distB;
      });
    }

    setFilteredListings(filtered);
  };

  const loadListings = async () => {
    try {
      const listingsData = await apiService.getListings();
      console.log('Explore - Loaded listings:', listingsData);
      const listingsWithCoords = listingsData.map((listing, index) => ({
        ...listing,
        latitude: listing.latitude || (51.5074 + (Math.random() - 0.5) * 0.1),
        longitude: listing.longitude || (-0.1278 + (Math.random() - 0.5) * 0.1),
      }));
      setListings(listingsWithCoords.length > 0 ? listingsWithCoords : mockListings);
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings(mockListings);
    } finally {
      setLoading(false);
    }
  };

      const handleLocateMe = async () => {
    await getUserLocation();
  };

  const handleMarkerPress = (listing) => {
    Alert.alert(
      listing.title,
      `${listing.description}\n\nLocation: ${listing.locationName}\nPosted by: ${listing.userName}`,
      [
        { text: 'Close', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('View details') }
      ]
    );
  };

  return (
    <View style={styles.fullContainer}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.exploreHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.exploreTitle}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

            <View style={styles.exploreContent}>
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="What are you looking for?"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, !isMapView && styles.activeToggle]} 
            onPress={() => setIsMapView(false)}
          >
            <Text style={[styles.toggleText, !isMapView && styles.activeToggleText]}>List</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, isMapView && styles.activeToggle]} 
            onPress={() => setIsMapView(true)}
          >
            <Text style={[styles.toggleText, isMapView && styles.activeToggleText]}>Map</Text>
          </TouchableOpacity>
        </View>

                {!isMapView && (
          <View style={styles.filterRow}>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Alert.alert(
                  'Filter by Type',
                  'Select categories to show',
                  [
                    { text: 'All', onPress: () => setSelectedTypes([]) },
                    { text: 'Free Food', onPress: () => setSelectedTypes(['free-food']) },
                    { text: 'Free Non-Food', onPress: () => setSelectedTypes(['free-non-food']) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterText}>Type ({selectedTypes.length || 'All'})</Text>
              <Feather name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Alert.alert(
                  'Sort By',
                  'Choose sorting method',
                  [
                    { text: 'Newest First', onPress: () => setSortBy('newest') },
                    { text: 'Oldest First', onPress: () => setSortBy('oldest') },
                    { text: 'Nearest First', onPress: () => setSortBy('nearest') },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterText}>Sort by</Text>
              <Feather name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => {
                Alert.alert(
                  'Distance Range',
                  'Show items within',
                  [
                    { text: '5 km', onPress: () => setMaxDistance(5) },
                    { text: '10 km', onPress: () => setMaxDistance(10) },
                    { text: '25 km', onPress: () => setMaxDistance(25) },
                    { text: '50 km', onPress: () => setMaxDistance(50) },
                    { text: '100 km', onPress: () => setMaxDistance(100) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Text style={styles.filterText}>{maxDistance} km</Text>
              <Feather name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
          </View>
        )}

                                {/* MAP VIEW SECTION */}
                {isMapView ? (
          <View style={styles.mapContainer}>
            {Platform.OS === 'web' ? (
              // Web fallback
              <View style={styles.mapPlaceholder}>
                <Ionicons name="map" size={64} color="#7C3AED" />
                <Text style={styles.mapPlaceholderText}>Map view is available on mobile devices</Text>
                <Text style={styles.mapPlaceholderSubtext}>{listings.length} listings within 25km</Text>
              </View>
            ) : (
              // Mobile - Real Map
              <MapView
                ref={mapRef}
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={mapRegion}
                region={mapRegion}
                onRegionChangeComplete={setMapRegion}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                loadingEnabled={true}
              >
                {/* Markers for each listing */}
                {listings.map((listing) => (
                  <Marker
                    key={listing._id}
                    coordinate={{
                      latitude: listing.latitude,
                      longitude: listing.longitude,
                    }}
                    onPress={() => handleMarkerPress(listing)}
                  >
                    <View style={styles.customMarker}>
                      <View style={styles.markerInner}>
                        <Ionicons name="fast-food" size={20} color="#fff" />
                      </View>
                      <View style={styles.markerTriangle} />
                    </View>
                  </Marker>
                ))}
                
                {/* User location marker */}
                {currentLocation && (
                  <Marker
                    coordinate={currentLocation}
                    title="You are here"
                  >
                    <View style={styles.userLocationMarker}>
                      <View style={styles.userLocationDot} />
                    </View>
                  </Marker>
                )}
              </MapView>
            )}
            
            {/* Overlay buttons */}
            <TouchableOpacity 
              style={styles.searchAreaButton} 
              onPress={() => {
                Alert.alert('Search Area', `Found ${listings.length} items in this area`);
              }}
            >
              <Text style={styles.searchAreaText}>Search this area</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.locateButton} 
              onPress={handleLocateMe}
            >
              <Ionicons name="locate" size={24} color="#7C3AED" />
            </TouchableOpacity>
            
                        {/* Listings count badge */}
            <View style={styles.listingsCountBadge}>
              <Ionicons name="fast-food" size={16} color="#fff" />
              <Text style={styles.listingsCountText}>{filteredListings.length}</Text>
            </View>
          </View>
        ) : (
          /* YOUR EXISTING LIST VIEW CODE */
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7C3AED" />
                <Text style={styles.loadingText}>Loading listings...</Text>
              </View>
            ) : (
                                                                                    <FlatList
                data={filteredListings}
                renderItem={({ item }) => (
                                    <TouchableOpacity 
                    style={styles.listingItem}
                    onPress={() => {
                      if (onSelectItem) onSelectItem(item);
                      onNavigate('itemDetail');
                    }}
                  >
                    <View style={styles.listingImageContainer}>
                      <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
                      <View style={styles.badgeContainer}>
                        <View style={styles.freeBadgeSmall}>
                          <Text style={styles.badgeText}>Free</Text>
                        </View>
                        <View style={styles.newBadge}>
                          <Text style={styles.badgeText}>New</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={styles.favoriteStar}>
                        <Ionicons name="star-outline" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.listingContent}>
                      <Text style={styles.listingTitle}>{item.title}</Text>
                      <View style={styles.listingUser}>
                        <View style={styles.userAvatarSmall}>
                          <Ionicons name="person" size={10} color="#7C3AED" />
                        </View>
                        <Text style={styles.listingUserName}>{item.userName}</Text>
                        <Text style={styles.listingRating}>⭐ {item.userRating}</Text>
                      </View>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={12} color="#666" />
                        <Text style={styles.listingLocation}>{item.distance}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
                keyExtractor={item => item._id}
              />
            )}
          </>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="compass-outline" size={24} color="#7C3AED" />
          <Text style={[styles.navText, styles.activeNavText]}>Explore</Text>
        
        </TouchableOpacity>
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
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('community')}>
          <Ionicons name="people-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messages')}>
          <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
// Messages Screen
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
              When you request food or chat with sellers, conversations will appear here
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
                  source={{ uri: item.listingImage || 'https://picsum.photos/60/60' }} 
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

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('explore')}>
          <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        
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
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('community')}>
          <Ionicons name="people-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messages')}>
          <Ionicons name="chatbubble-outline" size={24} color="#7C3AED" />
          <Text style={[styles.navText, styles.activeNavText]}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Helper function to format time
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} days ago`;
  return `${Math.floor(seconds / 2592000)} months ago`;
};

// Community Screen
const CommunityScreen = ({ onBack, onNavigate }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const postsData = await apiService.getPosts();
      console.log('Loaded posts:', postsData);
      // Add formatted time to posts
      const formattedPosts = postsData.map(post => ({
        ...post,
        time: post.createdAt ? formatTimeAgo(post.createdAt) : 'Just now'
      }));
      setPosts(formattedPosts.length > 0 ? formattedPosts : mockForumPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      // Fallback to mock data if API fails
      setPosts(mockForumPosts);
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
        <Text style={styles.exploreTitle}>Community</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.communityContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={({ item }) => (
              <View style={styles.postItem}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: item.userPhoto }} style={styles.postUserImage} />
                  <View style={styles.postUserInfo}>
                    <Text style={styles.postUserName}>{item.user}</Text>
                    <Text style={styles.postCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.postTime}>{item.time}</Text>
                </View>
                <Text style={styles.postContent}>{item.content}</Text>
                {item.image && (
                  <Image 
                    source={{ uri: item.image }} 
                    style={{ width: '100%', height: 200, borderRadius: 8, marginBottom: 12 }}
                    resizeMode="cover"
                  />
                )}
                <View style={styles.postFooter}>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="heart-outline" size={16} color="#666" />
                    <Text style={styles.postActionText}>{item.likes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.postAction}>
                    <Ionicons name="chatbubble-outline" size={16} color="#666" />
                    <Text style={styles.postActionText}>{item.comments}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            keyExtractor={item => item._id}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('explore')}>
          <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        
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
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('community')}>
          <Ionicons name="people-outline" size={24} color="#7C3AED" />
          <Text style={[styles.navText, styles.activeNavText]}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messages')}>
          <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Profile Screen
const ProfileScreen = ({ user, onBack, onLogout }) => (
  <View style={styles.fullContainer}>
    <StatusBar barStyle="dark-content" />
    
    <View style={styles.exploreHeader}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>
      <Text style={styles.exploreTitle}>My Profile</Text>
      <TouchableOpacity onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>

    <ScrollView style={styles.profileContent}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#7C3AED" />
        </View>
        <Text style={styles.profileName}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.profileSection}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="location-outline" size={20} color="#666" />
          <Text style={styles.menuText}>Location</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#666" />
          <Text style={styles.menuText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <Text style={styles.menuText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  </View>
);

// Category Screen
const CategoryScreen = ({ category, onBack, onNavigate, user, onSetCategory }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      loadCategoryListings();
    }
  }, [category]);

      const loadCategoryListings = async () => {
    setLoading(true);
    try {
      const allListings = await apiService.getListings();
      const filtered = allListings.filter(item => item.category === category.id);
      console.log('Category listings:', filtered);
      setListings(filtered.length > 0 ? filtered : mockListings.filter(item => item.category === category.id));
    } catch (error) {
      console.error('Error loading listings:', error);
      setListings(mockListings.filter(item => item.category === category.id));
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
        <Text style={styles.exploreTitle}>{category?.title || 'Category'}</Text>
        <TouchableOpacity>
          <Ionicons name="filter-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.categoryContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
        ) : listings.length > 0 ? (
          <FlatList
            data={listings}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.listingItem}>
                <View style={styles.listingImageContainer}>
                  <Image source={{ uri: item.imageUrl }} style={styles.listingImage} />
                  <View style={styles.badgeContainer}>
                    <View style={styles.freeBadgeSmall}>
                      <Text style={styles.badgeText}>Free</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.favoriteStar}>
                    <Ionicons name="star-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <View style={styles.listingContent}>
                  <Text style={styles.listingTitle}>{item.title}</Text>
                  <View style={styles.listingUser}>
                    <View style={styles.userAvatarSmall}>
                      <Ionicons name="person" size={10} color="#7C3AED" />
                    </View>
                    <Text style={styles.listingUserName}>{item.userName}</Text>
                    <Text style={styles.listingRating}>⭐ {item.userRating}</Text>
                  </View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={12} color="#666" />
                    <Text style={styles.listingLocation}>{item.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={item => item._id}
            ListHeaderComponent={() => (
              <View style={styles.categoryListHeader}>
                <Text style={styles.listCountText}>{listings.length} active listing(s)</Text>
                                        <TouchableOpacity 
              style={styles.addItemButtonSmall}
              onPress={() => {
                if (onSetCategory) onSetCategory(category);
                onNavigate('add');
              }}
            >
              <Text style={styles.addItemButtonText}>Add an item</Text>
            </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>{category?.title}</Text>
            <Text style={styles.emptyStateText}>
              There are no listings available within a 25 km radius{"\n"}Why not add something?
            </Text>
                                    <TouchableOpacity 
              style={styles.addItemButton}
              onPress={() => {
                if (onSetCategory) onSetCategory(category);
                onNavigate('add');
              }}
            >
              <Text style={styles.addItemButtonText}>Add an item</Text>
            </TouchableOpacity>
            <Text style={styles.advertisementText}>Advertisement</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={onBack}>
          <Ionicons name="home" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('explore')}>
          <Ionicons name="compass-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Explore</Text>
        </TouchableOpacity>
        
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
          <View style={styles.addButton}>
            <Ionicons name="add" size={30} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('community')}>
          <Ionicons name="people-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Community</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('messages')}>
          <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
          <Text style={styles.navText}>Messages</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Add Listing Screen
const AddListingScreen = ({ onBack, user, category }) => {
    const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: category?.id || 'free-non-food',
    categoryTitle: category?.title || 'Free non-food',
    quantity: '1',
    location: user?.location || '',
    imageUrl: '',
    latitude: null,
    longitude: null,
  });
      const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Request permissions and detect location on mount
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Please allow access to your photos to upload images.');
        }
      }
      await detectCurrentLocation();
    })();
  }, []);

  const detectCurrentLocation = async () => {
    try {
      setDetectingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Location permission is needed to show your item on the map');
        return;
      }
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
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
      console.log('✅ Location detected:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert('Location Error', 'Could not detect your location');
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
      // If conversion fails, return original URI
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
        quality: 0.3, // Lower quality for smaller file size
        base64: true, // Request base64 directly
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        // Use base64 if available, otherwise convert
        let imageData;
        if (asset.base64) {
          imageData = `data:image/jpeg;base64,${asset.base64}`;
        } else {
          // Fallback to conversion
          imageData = await convertToBase64(asset.uri);
        }
        
        const newImages = [...selectedImages, imageData];
        setSelectedImages(newImages);
        
        // Set first image as main imageUrl
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
    
    // Update main imageUrl if removed
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

    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Location Required', 'Please wait for location detection or tap the location button');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating listing with GPS:', {
        title: formData.title,
        lat: formData.latitude,
        lng: formData.longitude
      });

            const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        categoryTitle: formData.categoryTitle,
        quantity: formData.quantity,
        locationName: formData.location || 'Not specified',
        imageUrl: selectedImages.length > 0 ? selectedImages[0] : `https://picsum.photos/seed/${Date.now()}/400/400`,
        latitude: formData.latitude,
        longitude: formData.longitude,
        userRating: '5.0',
        distance: '0km'
      };

                  const result = await apiService.createListing(listingData);
      console.log('Listing created successfully:', result);
      
            Alert.alert('Success', 'Listing created successfully!', [
        { text: 'OK', onPress: () => {
          // Reload home screen data
          onBack();
        }}
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
        {formData.latitude && formData.longitude && (
          <Text style={styles.coordsText}>
            ✅ GPS: {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
          </Text>
        )}
        {!formData.latitude && !detectingLocation && (
          <Text style={styles.locationWarning}>
            ⚠️ Location not detected. Tap 📍 to try again.
          </Text>
        )}

        <TouchableOpacity 
          style={[styles.publishButton, loading && styles.disabledButton]}
          onPress={handleAddListing}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.publishButtonText}>Publish</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fullContainer}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorText}>Please close and reopen the app</Text>
            <TouchableOpacity
              style={styles.purpleButton}
              onPress={() => this.setState({ hasError: false, error: null })}
            >
              <Text style={styles.purpleButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

// Main App Component
function AppContent() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [user, setUser] = useState(null);
      const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [chatData, setChatData] = useState(null);

      useEffect(() => {
    const initApp = async () => {
      try {
        // Give time for native modules to load
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          // Token exists, show welcome screen
          // User will need to login again
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsAppReady(true);
      }
    };

    initApp();
  }, []);
  
  if (!isAppReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

            const handleLogin = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with email:', email);
      
      const response = await apiService.login(email, password);
      console.log('Login response received:', response);
      
      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      
      await AsyncStorage.setItem('userToken', token);
      console.log('Token stored, setting user state');
      
      setUser(user);
      setCurrentScreen('home');
      
      console.log('Login successful!');
    } catch (error) {
      console.error('Login error details:', error);
      Alert.alert('Login Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

        const handleRegister = async (userData) => {
    try {
      setIsLoading(true);
      
      console.log('Registering user with data:', userData);
      
      const response = await apiService.register(userData);
      console.log('Registration response:', response);

      const { token, user } = response;
      
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }

      // Store token
      await AsyncStorage.setItem('userToken', token);
      
      // Update app state
      setUser(user);
      setCurrentScreen('home');
    } catch (error) {
      console.error('Full registration error:', error);
      let errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      if (errorMessage.includes('already exists')) {
        errorMessage = 'This email is already registered. Please login instead.';
      }
      Alert.alert('Registration Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUser(null);
      setCurrentScreen('welcome');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

    const handleNavigate = (screen, category = null) => {
    if (category) {
      setCurrentCategory(category);
    }
    setCurrentScreen(screen);
  };

  const handleBack = () => {
    setCurrentScreen('home');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return (
          <WelcomeScreen
            onSignUp={() => setCurrentScreen('register')}
            onLogin={() => setCurrentScreen('login')}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onLogin={handleLogin}
            onBack={() => setCurrentScreen('welcome')}
            isLoading={isLoading}
          />
        );
      case 'register':
        return (
          <RegisterScreen
            onRegister={handleRegister}
            onBack={() => setCurrentScreen('welcome')}
            isLoading={isLoading}
          />
        );
                                    case 'home':
        return (
          <HomeScreen
            user={user}
            onNavigate={handleNavigate}
            onOpenMenu={() => handleNavigate('menu')}
            onLogout={handleLogout}
            onSelectItem={setSelectedItem}
          />
        );
            case 'explore':
        return (
          <ExploreScreen
            onBack={handleBack}
            onNavigate={handleNavigate}
            onSelectItem={setSelectedItem}
          />
        );
            case 'messages':
        return (
          <MessagesScreen
            onBack={handleBack}
            onNavigate={handleNavigate}
            onOpenChat={(data) => {
              setChatData(data);
              setCurrentScreen('chat');
            }}
            user={user}
          />
        );
      case 'community':
        return (
          <CommunityScreen
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            user={user}
            onBack={handleBack}
            onLogout={handleLogout}
          />
        );
                        case 'add':
        return (
          <AddListingScreen
            user={user}
            category={currentCategory}
            onBack={handleBack}
          />
        );
      case 'createPost':
        return (
          <CreatePostScreen
            user={user}
            onBack={(screen) => setCurrentScreen(screen || 'home')}
          />
        );
                        case 'category':
        return (
          <CategoryScreen
            category={currentCategory}
            onBack={handleBack}
            onNavigate={handleNavigate}
            user={user}
            onSetCategory={setCurrentCategory}
          />
        );
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
            case 'requests':
        return (
          <RequestsScreen
            user={user}
            onBack={handleBack}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            listing={chatData?.listing}
            otherUser={chatData?.otherUser}
            currentUser={user}
            onBack={handleBack}
          />
        );
      default:
        return (
          <WelcomeScreen
            onSignUp={() => setCurrentScreen('register')}
            onLogin={() => setCurrentScreen('login')}
          />
        );
    }
  };

  return renderScreen();
}

// Export wrapped in Error Boundary
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

// Styles
const styles = StyleSheet.create({
      welcomeContainer: {
    flex: 1,
    backgroundColor: '#FFA500',
  },
    welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
    welcomeTitle: {
    fontSize: 72,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 30,
    letterSpacing: -2,
  },
    welcomeSubtitle: {
    fontSize: 20,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '400',
  },
    welcomeButtons: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 50,
  },
  signUpButton: {
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
    signUpButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
    loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginPromptText: {
    color: '#fff',
    fontSize: 16,
  },
  loginLink: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  loginLinkText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  authHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  authTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  backButton: {
    padding: 4,
  },
  authContent: {
    flex: 1,
    padding: 20,
  },
    sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    marginTop: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#333',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  inputField: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingVertical: 12,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  purpleButton: {
    backgroundColor: '#4A1D70',
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  purpleButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  linkText: {
    color: '#4A1D70',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A1D70',
    borderColor: '#4A1D70',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  loginButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center'
  },
  disabledButton: {
    opacity: 0.7
  },
  fullContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
    homeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
    greetingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
    locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    marginLeft: 4,
    marginRight: 4,
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
  },
  locationSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    marginLeft: 20,
  },
  profileButton: {
    padding: 4,
  },
  homeContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  getStartedSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  getStartedCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
    getStartedCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emojiCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
    getStartedEmoji: {
    fontSize: 28,
  },
    getStartedText: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    lineHeight: 15,
  },
  foodSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
    foodCard: {
    width: 180,
    marginRight: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  foodImageContainer: {
    position: 'relative',
    width: '100%',
    height: 140,
  },
      foodImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  freeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  freeBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardContent: {
    padding: 8,
  },
    userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
    userName: {
    fontSize: 11,
    color: '#7C3AED',
    marginRight: 4,
  },
    userRating: {
    fontSize: 10,
    color: '#666',
    marginLeft: 'auto',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  foodDistance: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
    foodTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
    foodLocation: {
    fontSize: 11,
    color: '#666',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  oldPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginRight: 6,
  },
  newPrice: {
    fontSize: 13,
    color: '#000',
    fontWeight: '600',
    marginRight: 6,
  },
  discount: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  activeNavText: {
    color: '#7C3AED',
  },
  addButton: {
    backgroundColor: '#7C3AED',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  exploreHeader: {
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
  exploreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  exploreContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    margin: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#000',
  },
    listingItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  listingImageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  badgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  freeBadgeSmall: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    marginBottom: 4,
  },
  newBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  favoriteStar: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarSmall: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
    listingImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
    listingContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
    listingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
  },
    listingUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
    listingUserName: {
    fontSize: 12,
    color: '#7C3AED',
    marginRight: 8,
  },
    listingRating: {
    fontSize: 11,
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
    listingLocation: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#000',
    marginRight: 4,
  },
  messagesContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    alignItems: 'center',
  },
  messageAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  messageAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  messageContent: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  messageFrom: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 18,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#7C3AED',
    marginLeft: 8,
  },
  communityContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  postItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postUserInfo: {
    flex: 1,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  postCategory: {
    fontSize: 12,
    color: '#7C3AED',
  },
  postTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  postContent: {
    fontSize: 14,
    color: '#000',
    lineHeight: 20,
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
  },
  postAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  postActionText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  profileContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#6B7280',
  },
  profileSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '500',
  },
  addListingContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  publishButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  publishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  toggleContainer: {
  flexDirection: 'row',
  margin: 20,
  backgroundColor: '#F3F4F6',
  borderRadius: 8,
  padding: 4,
},
toggleButton: {
  flex: 1,
  paddingVertical: 8,
  alignItems: 'center',
  borderRadius: 6,
},
activeToggle: {
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 2,
},
toggleText: {
  fontSize: 14,
  fontWeight: '500',
  color: '#6B7280',
},
activeToggleText: {
  color: '#7C3AED',
},
mapContainer: {
  flex: 1,
  position: 'relative',
},
map: {
  flex: 1,
  width: '100%',
  height: '100%',
},
mapPlaceholder: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F3F4F6',
  padding: 20,
},
mapPlaceholderText: {
  fontSize: 16,
  color: '#4B5563',
  marginTop: 16,
  textAlign: 'center',
},
mapPlaceholderSubtext: {
  fontSize: 14,
  color: '#9CA3AF',
  marginTop: 8,
},
mapOverlay: {
  alignItems: 'center',
  padding: 20,
},
mapTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#374151',
  marginTop: 16,
},
mapSubtitle: {
  fontSize: 16,
  color: '#6B7280',
  marginTop: 8,
  textAlign: 'center',
},
locateButton: {
  flexDirection: 'row',
  backgroundColor: '#7C3AED',
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: 'center',
  marginTop: 20,
},
locateButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
},
searchAreaButton: {
  position: 'absolute',
  top: 80,
  alignSelf: 'center',
  backgroundColor: '#7C3AED',
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 25,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
searchAreaText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
},
locateButton: {
  position: 'absolute',
  bottom: 120,
  right: 20,
  backgroundColor: '#fff',
  width: 50,
  height: 50,
  borderRadius: 25,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
listingsCountBadge: {
  position: 'absolute',
  top: 20,
  left: 20,
  backgroundColor: '#10B981',
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 20,
  flexDirection: 'row',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
  elevation: 5,
},
listingsCountText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '700',
  marginLeft: 4,
},
customMarker: {
  alignItems: 'center',
},
markerInner: {
  backgroundColor: '#EF4444',
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: 'center',
  alignItems: 'center',
  borderWidth: 3,
  borderColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 3,
  elevation: 5,
},
markerTriangle: {
  width: 0,
  height: 0,
  backgroundColor: 'transparent',
  borderStyle: 'solid',
  borderLeftWidth: 6,
  borderRightWidth: 6,
  borderTopWidth: 10,
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderTopColor: '#fff',
  marginTop: -3,
},
userLocationMarker: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: 'rgba(124, 58, 237, 0.3)',
  justifyContent: 'center',
  alignItems: 'center',
},
userLocationDot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: '#7C3AED',
  borderWidth: 2,
  borderColor: '#fff',
},
// New Category Card Styles
categoryCardNew: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 15,
  borderRadius: 12,
  marginBottom: 10,
},
categoryIconContainer: {
  width: 40,
  height: 40,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 15,
  borderRadius: 20,
  backgroundColor: 'rgba(255,255,255,0.7)',
},
categoryIcon: {
  fontSize: 20,
},
categoryContent: {
  flex: 1,
},
categoryTitle: {
  fontSize: 16,
  fontWeight: '700',
  color: '#1F2937',
},
categoryDescription: {
  fontSize: 12,
  color: '#4B5563',
},
categoriesSection: {
  backgroundColor: '#fff',
  padding: 20,
  marginTop: 8,
},
categoryGrid: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 12,
},
categoryCard: {
  width: (width - 52) / 2,
  height: 140,
  borderRadius: 16,
  padding: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
categoryCardFull: {
  width: '100%',
  height: 140,
  borderRadius: 16,
  padding: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
categoryCardIcon: {
  fontSize: 48,
  marginBottom: 12,
},
categoryCardTitle: {
  fontSize: 18,
  fontWeight: '700',
  color: '#1F2937',
  textAlign: 'center',
},
helpSection: {
  backgroundColor: '#fff',
  padding: 20,
  marginTop: 8,
  marginBottom: 20,
},
helpButton: {
  backgroundColor: '#E5E7EB',
  padding: 15,
  borderRadius: 8,
  alignItems: 'center',
},
helpButtonText: {
  fontSize: 16,
  fontWeight: '600',
  color: '#1F2937',
},
categoryContent: {
  flex: 1,
  backgroundColor: '#fff',
},
categoryListHeader: {
  padding: 20,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
listCountText: {
  fontSize: 14,
  color: '#6B7280',
  marginBottom: 10,
},
addItemButton: {
  backgroundColor: '#7C3AED',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 8,
  marginVertical: 20,
},
addItemButtonSmall: {
  backgroundColor: '#7C3AED',
  paddingVertical: 10,
  paddingHorizontal: 24,
  borderRadius: 8,
},
addItemButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
advertisementText: {
  textAlign: 'center',
  color: '#9CA3AF',
  fontSize: 12,
  marginVertical: 15,
},
// Image Upload Styles
imageUploadSection: {
  marginBottom: 20,
  minHeight: 120,
},
imagePreviewContainer: {
  position: 'relative',
  marginRight: 12,
  width: 100,
  height: 100,
  borderRadius: 8,
  overflow: 'hidden',
},
imagePreview: {
  width: '100%',
  height: '100%',
  borderRadius: 8,
  backgroundColor: '#F3F4F6',
},
removeImageButton: {
  position: 'absolute',
  top: 4,
  right: 4,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  borderRadius: 12,
  width: 24,
  height: 24,
  justifyContent: 'center',
  alignItems: 'center',
},
mainImageBadge: {
  position: 'absolute',
  bottom: 4,
  left: 4,
  backgroundColor: '#7C3AED',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 4,
},
mainImageText: {
  color: '#fff',
  fontSize: 10,
  fontWeight: '600',
},
addImageButton: {
  width: 100,
  height: 100,
  borderRadius: 8,
  borderWidth: 2,
  borderColor: '#7C3AED',
  borderStyle: 'dashed',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
},
addImageText: {
  color: '#7C3AED',
  fontSize: 12,
  fontWeight: '600',
  marginTop: 4,
},
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
errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 40,
  backgroundColor: '#fff',
},
errorTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#000',
  marginBottom: 16,
  textAlign: 'center',
},
errorText: {
  fontSize: 16,
  color: '#666',
  marginBottom: 32,
  textAlign: 'center',
},
menuHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 20,
  paddingTop: Platform.OS === 'ios' ? 60 : 40,
  paddingBottom: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
  backgroundColor: '#fff',
},
menuHeaderTitle: {
  fontSize: 18,
  fontWeight: '600',
  color: '#000',
},
closeButton: {
  padding: 4,
},
menuContent: {
  flex: 1,
  backgroundColor: '#F9FAFB',
},
menuProfileSection: {
  backgroundColor: '#fff',
  padding: 30,
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomColor: '#E5E7EB',
},
menuProfileAvatar: {
  width: 80,
  height: 80,
  borderRadius: 40,
  backgroundColor: '#F3E8FF',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 12,
},
menuProfileName: {
  fontSize: 20,
  fontWeight: '700',
  color: '#000',
  marginBottom: 16,
},
supporterButton: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#4A1D70',
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 25,
},
supporterButtonText: {
  color: '#fff',
  fontSize: 14,
  fontWeight: '600',
  marginLeft: 8,
},
menuSection: {
  backgroundColor: '#fff',
  marginTop: 12,
  paddingVertical: 8,
},
menuSectionTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: '#9CA3AF',
  paddingHorizontal: 20,
  paddingVertical: 12,
},
menuItemText: {
  flex: 1,
  fontSize: 16,
  color: '#000',
  marginLeft: 12,
},
logoutButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  marginTop: 12,
  marginHorizontal: 20,
  marginBottom: 40,
  paddingVertical: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#EF4444',
},
logoutButtonText: {
  color: '#EF4444',
  fontSize: 16,
  fontWeight: '600',
  marginLeft: 8,
},
logoutButtonProfile: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#fff',
  paddingVertical: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#EF4444',
  marginTop: 20,
},
  logoutButtonProfileText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
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
});