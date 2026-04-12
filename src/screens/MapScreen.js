import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated, Easing, Dimensions, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker } from 'react-native-maps';
import { EVENTS } from '../data/events';
import { VENUES } from '../data/venues';
import { CATEGORIES } from '../data/categories';
import { useAdmin } from '../context/AdminContext';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;
var TAB_HEIGHT = 60;
var SHEET_HEIGHT = H * 0.62;

var ALL_FILTERS = [{ key: 'all', label: 'Tout' }].concat(
  Object.keys(CATEGORIES).map(function (k) { return { key: k, label: CATEGORIES[k].label }; })
);

// ─── LOCATION PERMISSION MODAL ───
function LocationPermissionModal({ visible, onAllow, onDeny }) {
  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: W * 0.76, backgroundColor: '#f2f2f7', borderRadius: 14 }}>
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Image
              source={require('../../assets/events/logo.jpeg')}
              style={{ width: 56, height: 56, borderRadius: 12, marginBottom: 14 }}
            />
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#000', textAlign: 'center', marginBottom: 8, lineHeight: 22 }}>
              "Lumina" souhaite acceder{'\n'}a votre position
            </Text>
            <Text style={{ fontSize: 13, color: '#444', textAlign: 'center', lineHeight: 18 }}>
              Votre position permet d'afficher les evenements culturels autour de vous et de personnaliser vos recommandations.
            </Text>
          </View>
          <View style={{ height: 0.5, backgroundColor: '#c8c8cc' }} />
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              onPress={onDeny}
              style={{ flex: 1, paddingVertical: 15, alignItems: 'center', borderRightWidth: 0.5, borderRightColor: '#c8c8cc' }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 17, color: '#007AFF' }}>Refuser</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onAllow}
              style={{ flex: 1, paddingVertical: 15, alignItems: 'center' }}
              activeOpacity={0.6}
            >
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#007AFF' }}>Autoriser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── EVENT MARKER (admin-controlled pins) ───
function EventMarker({ event, onPress }) {
  var cat = CATEGORIES[event.category];
  return (
    <Marker
      coordinate={{ latitude: event.latitude, longitude: event.longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={{
          width: 34, height: 34, borderRadius: 9,
          backgroundColor: cat.color,
          justifyContent: 'center', alignItems: 'center',
          borderWidth: 2.5, borderColor: '#fff',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3, shadowRadius: 4,
        }}>
          <Ionicons name="ticket-outline" size={16} color="#fff" />
        </View>
        <View style={{ width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: cat.color, marginTop: 1 }} />
      </View>
    </Marker>
  );
}

// ─── VENUE MARKER ───
function VenueMarker({ venue, onPress }) {
  var cat = CATEGORIES[venue.category];
  var size = venue.major ? 48 : 36;
  var iconSize = venue.major ? 22 : 16;
  return (
    <Marker
      coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
      onPress={onPress}
      tracksViewChanges={false}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          backgroundColor: cat.color,
          justifyContent: 'center', alignItems: 'center',
          borderWidth: venue.major ? 3 : 2, borderColor: '#fff',
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: venue.major ? 0.35 : 0.2, shadowRadius: 4,
        }}>
          <Ionicons name={cat.icon} size={iconSize} color="#fff" />
        </View>
        {venue.major ? (
          <View style={{ backgroundColor: '#fff', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, marginTop: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.12, shadowRadius: 2 }}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#1a1a1a' }} numberOfLines={1}>{venue.name}</Text>
          </View>
        ) : null}
        <View style={{ width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: cat.color, marginTop: venue.major ? -1 : 1 }} />
      </View>
    </Marker>
  );
}

// ─── POUR TOI STRIP ───
function PourToiStrip({ events, navigation }) {
  if (!events || events.length === 0) return null;
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: TAB_HEIGHT + 10 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="sparkles" size={12} color="#E85D3A" style={{ marginRight: 5 }} />
        <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Pour vous</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
        {events.map(function (ev) {
          var cat = CATEGORIES[ev.category];
          return (
            <TouchableOpacity
              key={ev.id}
              onPress={function () { navigation.navigate('EventDetail', { event: ev }); }}
              style={{ width: 190, height: 100, borderRadius: 14, marginRight: 10, overflow: 'hidden' }}
              activeOpacity={0.85}
            >
              <Image source={ev.image} style={{ width: 190, height: 100, position: 'absolute' }} />
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', padding: 10, justifyContent: 'flex-end' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                  <View style={{ backgroundColor: cat.color, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{cat.label}</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }} numberOfLines={1}>{ev.title}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>{ev.price}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── VENUE SHEET ───
function VenueSheet({ venue, onClose, navigation, sheetAnim, overlayAnim }) {
  var insets = useSafeAreaInsets();
  var venueEvents = EVENTS.filter(function (e) { return e.venueId === venue.id; });
  var cat = CATEGORIES[venue.category];
  var _s1 = useState(false); var liked = _s1[0]; var setLiked = _s1[1];
  var _s2 = useState(false); var saved = _s2[0]; var setSaved = _s2[1];

  return (
    <>
      <Animated.View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', opacity: overlayAnim }}
        pointerEvents="box-none"
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: SHEET_HEIGHT,
        backgroundColor: '#fff',
        borderTopLeftRadius: 24, borderTopRightRadius: 24,
        transform: [{ translateY: sheetAnim }],
        overflow: 'hidden',
      }}>
        {venue.image ? (
          <View style={{ width: '100%', height: 140 }}>
            <Image source={venue.image} style={{ width: '100%', height: 140 }} resizeMode="cover" />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.22)' }} />
            <View style={{ position: 'absolute', top: 10, alignSelf: 'center', width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.7)' }} />
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 6 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#e0e0e0' }} />
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 20, paddingTop: venue.image ? 12 : 4, paddingBottom: 10 }}>
          <View style={{ width: 46, height: 46, borderRadius: 12, backgroundColor: cat.color + '20', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
            <Ionicons name={cat.icon} size={22} color={cat.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 19, fontWeight: '800', color: '#1a1a1a', lineHeight: 24 }}>{venue.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3 }}>
              <View style={{ paddingHorizontal: 9, paddingVertical: 2, borderRadius: 8, backgroundColor: cat.color + '18', marginRight: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: cat.color }}>{cat.label}</Text>
              </View>
              {venue.major ? (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: '#FFF0EC' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#E85D3A' }}>Lieu emblematique</Text>
                </View>
              ) : null}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Ionicons name="location-outline" size={11} color="#999" style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, color: '#999' }} numberOfLines={1}>{venue.address}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
            <TouchableOpacity
              onPress={function () { setLiked(!liked); }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginRight: 8 }}
            >
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={17} color={liked ? '#E85D3A' : '#666'} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={function () { setSaved(!saved); }}
              style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center' }}
            >
              <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={17} color={saved ? '#E85D3A' : '#666'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: '#f0f0f0', marginHorizontal: 20, marginBottom: 2 }} />

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_HEIGHT + 24 }} showsVerticalScrollIndicator={false}>

          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 14, marginBottom: 10 }}>En cours</Text>
          {venueEvents.length > 0 ? venueEvents.map(function (ev) {
            return (
              <TouchableOpacity
                key={ev.id}
                onPress={function () { onClose(); navigation.navigate('EventDetail', { event: ev }); }}
                style={{ flexDirection: 'row', backgroundColor: '#f8f8f8', borderRadius: 14, marginBottom: 10, overflow: 'hidden' }}
                activeOpacity={0.8}
              >
                <Image source={ev.image} style={{ width: 80, height: 80 }} />
                <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }} numberOfLines={1}>{ev.title}</Text>
                  <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }} numberOfLines={1}>{ev.subtitle}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: cat.color, marginRight: 10 }}>{ev.price}</Text>
                    <View style={{ flex: 1 }} />
                    <Ionicons name="chevron-forward" size={14} color="#ccc" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }) : (
            <View style={{ backgroundColor: '#f8f8f8', borderRadius: 12, padding: 18, alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="calendar-outline" size={26} color="#ddd" />
              <Text style={{ fontSize: 13, color: '#bbb', marginTop: 8 }}>Aucun evenement en cours</Text>
            </View>
          )}

          {venue.upcoming && venue.upcoming.length > 0 ? (
            <>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginTop: 8, marginBottom: 10 }}>A venir</Text>
              {venue.upcoming.map(function (item, i) {
                return (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
                    <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: cat.color + '15', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                      <Ionicons name={cat.icon} size={16} color={cat.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1a1a1a' }}>{item.title}</Text>
                      <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{item.date}</Text>
                    </View>
                    <View style={{ backgroundColor: '#f0f0f0', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                      <Text style={{ fontSize: 10, color: '#888' }}>A venir</Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : null}

        </ScrollView>
      </Animated.View>
    </>
  );
}

// ─── MAIN SCREEN ───
export default function MapScreen({ navigation, userPrefs }) {
  var insets = useSafeAreaInsets();
  var { config } = useAdmin();
  var _s1 = useState('all'); var activeFilter = _s1[0]; var setActiveFilter = _s1[1];
  var _s2 = useState(null); var selectedVenue = _s2[0]; var setSelectedVenue = _s2[1];
  var _s3 = useState(true); var showLocModal = _s3[0]; var setShowLocModal = _s3[1];

  var sheetAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  var overlayAnim = useRef(new Animated.Value(0)).current;
  var sheetOpen = useRef(false);

  var visibleEvents = EVENTS.filter(function (e) {
    return config[e.id] && config[e.id].mapVisible;
  });

  var filteredVenues = activeFilter === 'all'
    ? VENUES
    : VENUES.filter(function (v) { return v.category === activeFilter; });

  var recommended = React.useMemo(function () {
    if (!userPrefs || userPrefs.length === 0) return EVENTS;
    var matched = EVENTS.filter(function (e) { return userPrefs.indexOf(e.category) >= 0; });
    return matched.length > 0 ? matched : EVENTS;
  }, [userPrefs]);

  function openSheet(venue) {
    setSelectedVenue(venue);
    if (!sheetOpen.current) {
      sheetOpen.current = true;
      Animated.parallel([
        Animated.spring(sheetAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }

  function closeSheet() {
    sheetOpen.current = false;
    Animated.parallel([
      Animated.timing(sheetAnim, { toValue: SHEET_HEIGHT, duration: 280, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      Animated.timing(overlayAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start(function () { setSelectedVenue(null); });
  }

  var TOP_BAR_HEIGHT = insets.top + 52;

  return (
    <View style={{ flex: 1 }}>
      {/* Location permission */}
      <LocationPermissionModal
        visible={showLocModal}
        onAllow={function () { setShowLocModal(false); }}
        onDeny={function () { setShowLocModal(false); }}
      />

      <MapView
        style={{ flex: 1 }}
        initialRegion={{ latitude: 48.8600, longitude: 2.3450, latitudeDelta: 0.09, longitudeDelta: 0.09 }}
        showsUserLocation={true}
        showsCompass={false}
      >
        {filteredVenues.map(function (venue) {
          return (
            <VenueMarker
              key={venue.id}
              venue={venue}
              onPress={function () { openSheet(venue); }}
            />
          );
        })}
        {visibleEvents.map(function (ev) {
          return (
            <EventMarker
              key={'ev-' + ev.id}
              event={ev}
              onPress={function () { navigation.navigate('EventDetail', { event: ev }); }}
            />
          );
        })}
      </MapView>

      {/* Top bar */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, paddingTop: insets.top + 8, paddingBottom: 8, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <TouchableOpacity onPress={function () { navigation.navigate('Profil'); }} style={{ marginRight: 10 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person-outline" size={18} color="#333" />
            </View>
            <View style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E85D3A', borderWidth: 2, borderColor: '#fff' }} />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#E85D3A', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={16} color="#fff" />
          </View>
        </View>
        <TouchableOpacity style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
          <Ionicons name="options-outline" size={18} color="#333" />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a1a' }}>Paris</Text>
          <Ionicons name="chevron-down" size={14} color="#666" style={{ marginLeft: 4 }} />
        </View>
      </View>

      {/* Category filter chips */}
      <View style={{ position: 'absolute', top: TOP_BAR_HEIGHT, left: 0, right: 0, zIndex: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingVertical: 6 }}>
          {ALL_FILTERS.map(function (f) {
            var active = activeFilter === f.key;
            var cat = f.key !== 'all' ? CATEGORIES[f.key] : null;
            var color = cat ? cat.color : '#1a1a1a';
            return (
              <TouchableOpacity
                key={f.key}
                onPress={function () { setActiveFilter(f.key); }}
                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, marginRight: 8, backgroundColor: active ? color : '#fff' }}
                activeOpacity={0.75}
              >
                {cat ? <Ionicons name={cat.icon} size={12} color={active ? '#fff' : color} style={{ marginRight: 4 }} /> : null}
                <Text style={{ fontSize: 12, fontWeight: '600', color: active ? '#fff' : '#333' }}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* FABs */}
      <View style={{ position: 'absolute', right: 16, bottom: TAB_HEIGHT + insets.bottom + 180, zIndex: 10 }}>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>
          <Ionicons name="refresh" size={18} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="navigate" size={18} color="#555" />
        </TouchableOpacity>
      </View>

      {/* Pour toi strip */}
      {!selectedVenue ? <PourToiStrip events={recommended} navigation={navigation} /> : null}

      {/* Venue sheet */}
      {selectedVenue ? (
        <VenueSheet
          venue={selectedVenue}
          onClose={closeSheet}
          navigation={navigation}
          sheetAnim={sheetAnim}
          overlayAnim={overlayAnim}
        />
      ) : null}
    </View>
  );
}
