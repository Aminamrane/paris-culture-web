import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions, Modal, Animated, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CATEGORIES } from '../data/categories';
import { useAuth } from '../context/AuthContext';

var W = Dimensions.get('window').width;
var ADMIN_PIN = '1234';

// ─── PIN MODAL ───
function PinModal({ visible, onSuccess, onClose }) {
  var _s1 = useState(''); var pin = _s1[0]; var setPin = _s1[1];
  var _s2 = useState(false); var error = _s2[0]; var setError = _s2[1];
  var shakeAnim = useRef(new Animated.Value(0)).current;

  function shake() {
    Vibration.vibrate(300);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function pressDigit(d) {
    if (pin.length >= 4) return;
    var next = pin + d;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      if (next === ADMIN_PIN) {
        setTimeout(function () { setPin(''); onSuccess(); }, 200);
      } else {
        shake();
        setError(true);
        setTimeout(function () { setPin(''); setError(false); }, 800);
      }
    }
  }

  function pressDelete() {
    setPin(pin.slice(0, -1));
    setError(false);
  }

  function handleClose() {
    setPin('');
    setError(false);
    onClose();
  }

  var KEYS = [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    [null,'0','del'],
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} statusBarTranslucent onRequestClose={handleClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#0d1117', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, paddingTop: 24 }}>
          {/* Handle */}
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#30363d', alignSelf: 'center', marginBottom: 24 }} />

          {/* Header */}
          <View style={{ alignItems: 'center', marginBottom: 32, paddingHorizontal: 24 }}>
            <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: '#F5A62320', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
              <Ionicons name="shield-checkmark" size={30} color="#F5A623" />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#e6edf3' }}>Acces Administrateur</Text>
            <Text style={{ fontSize: 14, color: '#8b949e', marginTop: 6, textAlign: 'center' }}>
              Entrez votre code PIN pour continuer
            </Text>
          </View>

          {/* Dots */}
          <Animated.View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 36, transform: [{ translateX: shakeAnim }] }}>
            {[0,1,2,3].map(function (i) {
              var filled = i < pin.length;
              return (
                <View key={i} style={{
                  width: 16, height: 16, borderRadius: 8, marginHorizontal: 10,
                  backgroundColor: error ? '#FF4444' : filled ? '#F5A623' : '#30363d',
                  borderWidth: 2,
                  borderColor: error ? '#FF4444' : filled ? '#F5A623' : '#30363d',
                }} />
              );
            })}
          </Animated.View>

          {/* Keypad */}
          <View style={{ paddingHorizontal: 40 }}>
            {KEYS.map(function (row, ri) {
              return (
                <View key={ri} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                  {row.map(function (key, ki) {
                    if (key === null) {
                      return <View key={ki} style={{ width: 72, height: 72 }} />;
                    }
                    if (key === 'del') {
                      return (
                        <TouchableOpacity key={ki} onPress={pressDelete} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#21262d', justifyContent: 'center', alignItems: 'center' }} activeOpacity={0.6}>
                          <Ionicons name="backspace-outline" size={24} color="#8b949e" />
                        </TouchableOpacity>
                      );
                    }
                    return (
                      <TouchableOpacity key={ki} onPress={function () { pressDigit(key); }} style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#161b22', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#30363d' }} activeOpacity={0.6}>
                        <Text style={{ fontSize: 24, fontWeight: '600', color: '#e6edf3' }}>{key}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* Cancel */}
          <TouchableOpacity onPress={handleClose} style={{ alignItems: 'center', marginTop: 8 }}>
            <Text style={{ fontSize: 15, color: '#8b949e', fontWeight: '500' }}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

var SAVED_EVENTS = [
  { id: '1', title: 'Zoo Art Show', category: 'street', date: '21 Fev - 8 Mars', price: '18 EUR', image: require('../../assets/events/1.avif') },
  { id: '2', title: 'Paradox Museum', category: 'immersif', date: 'Permanent', price: '19 EUR', image: require('../../assets/events/2.avif') },
  { id: '4', title: "L'Odyssee Celeste", category: 'musique', date: 'Mars 2026', price: '15 EUR', image: require('../../assets/events/4.avif') },
];

var SAVED_VENUES = [
  { id: 'v1', name: 'Le Louvre', category: 'expo', address: 'Rue de Rivoli, 75001', image: require('../../assets/events/louvre.jpg') },
  { id: 'lb1', name: 'Shakespeare & Company', category: 'litterature', address: '37 Rue de la Bucherie, 75005', image: require('../../assets/events/shakespeare.jpg') },
  { id: 'v6', name: 'Philharmonie de Paris', category: 'musique', address: '221 Av. Jean Jaures, 75019', image: require('../../assets/events/philharmonie.jpg') },
];

var ACTIVITY = [
  { id: 'a1', type: 'like', text: 'A aime Zoo Art Show', time: 'Il y a 2h', icon: 'heart', color: '#2563EB', category: 'street' },
  { id: 'a2', type: 'save', text: 'A sauvegarde Le Louvre', time: 'Il y a 5h', icon: 'bookmark', color: '#3498DB', category: 'expo' },
  { id: 'a3', type: 'view', text: 'A consulte Paradox Museum', time: 'Hier', icon: 'eye', color: '#27AE60', category: 'immersif' },
  { id: 'a4', type: 'comment', text: "A commente L'Odyssee Celeste", time: 'Il y a 2 jours', icon: 'chatbubble', color: '#9B59B6', category: 'musique' },
  { id: 'a5', type: 'save', text: 'A sauvegarde Philharmonie de Paris', time: 'Il y a 3 jours', icon: 'bookmark', color: '#3498DB', category: 'musique' },
  { id: 'a6', type: 'like', text: 'A aime Science Experiences', time: 'Il y a 4 jours', icon: 'heart', color: '#2563EB', category: 'immersif' },
];

var TABS = [
  { key: 'events', label: 'Evenements', icon: 'bookmark-outline' },
  { key: 'venues', label: 'Lieux', icon: 'location-outline' },
  { key: 'journal', label: 'Journal', icon: 'time-outline' },
];

export default function ProfileScreen({ navigation, currentUser }) {
  var insets = useSafeAreaInsets();
  var _s = useState('events'); var tab = _s[0]; var setTab = _s[1];
  var auth = useAuth(); // eslint-disable-line
  var isAdmin = currentUser && currentUser.isAdmin;
  var displayName = currentUser ? currentUser.name : 'Visiteur';
  var displayEmail = currentUser ? currentUser.email : '';
  // showPin/PinModal removed — auth is handled by account system

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: insets.top + 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={function () { navigation.goBack(); }}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{ fontSize: 17, fontWeight: '700', color: '#1a1a1a' }}>Profil</Text>
            <TouchableOpacity onPress={function () { auth.logout(); navigation.goBack(); }}>
              <Ionicons name="log-out-outline" size={22} color="#2563EB" />
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={{ alignItems: 'center', marginBottom: 20 }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 12, borderWidth: 3, borderColor: isAdmin ? '#F5A623' : '#2563EB', backgroundColor: isAdmin ? '#1a1505' : '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name={isAdmin ? 'shield-checkmark' : 'person'} size={40} color={isAdmin ? '#F5A623' : '#999'} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#1a1a1a' }}>{displayName}</Text>
            {isAdmin ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5A62315', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 8, borderWidth: 1, borderColor: '#F5A62340' }}>
                <Ionicons name="shield-checkmark" size={13} color="#F5A623" style={{ marginRight: 5 }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#F5A623' }}>Administrateur Lumina</Text>
              </View>
            ) : (
              <Text style={{ fontSize: 14, color: '#888', marginTop: 4 }}>{displayEmail}</Text>
            )}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Ionicons name="location-outline" size={14} color="#888" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 13, color: '#888' }}>Paris, France</Text>
            </View>
          </View>

          {/* Stats — masques pour admin */}
          {!isAdmin ? (
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' }}>
              {[{ v: '23', l: 'Evenements' }, { v: '148', l: 'Abonnes' }, { v: '92', l: 'Abonnements' }].map(function (s, i) {
                return (
                  <View key={i} style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a' }}>{s.v}</Text>
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{s.l}</Text>
                  </View>
                );
              })}
            </View>
          ) : null}

          {/* Action buttons */}
          {!isAdmin ? (
            <View style={{ flexDirection: 'row', marginTop: 16, marginBottom: 4 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#2563EB', alignItems: 'center', marginRight: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Modifier le profil</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f5f5f5', alignItems: 'center', marginLeft: 5 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#333' }}>Partager</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginTop: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingHorizontal: 20 }}>
          {TABS.map(function (t) {
            var active = tab === t.key;
            return (
              <TouchableOpacity key={t.key} onPress={function () { setTab(t.key); }} style={{ flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: active ? 2 : 0, borderBottomColor: '#2563EB' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name={t.icon} size={14} color={active ? '#2563EB' : '#999'} style={{ marginRight: 4 }} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#2563EB' : '#999' }}>{t.label}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Tab: Evenements sauvegardes */}
        {tab === 'events' ? (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="bookmark" size={15} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>Evenements sauvegardes</Text>
              <View style={{ marginLeft: 8, backgroundColor: '#FFF0EC', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#2563EB' }}>{SAVED_EVENTS.length}</Text>
              </View>
            </View>
            {SAVED_EVENTS.map(function (ev) {
              var cat = CATEGORIES[ev.category];
              return (
                <TouchableOpacity key={ev.id} style={{ flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                  <Image source={ev.image} style={{ width: 90, height: 90 }} resizeMode="cover" />
                  <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>{ev.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name={cat.icon} size={10} color={cat.color} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, color: cat.color, fontWeight: '600' }}>{cat.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="calendar-outline" size={11} color="#888" style={{ marginRight: 3 }} />
                        <Text style={{ fontSize: 11, color: '#888' }}>{ev.date}</Text>
                      </View>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: cat.color }}>{ev.price}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Tab: Lieux sauvegardes */}
        {tab === 'venues' ? (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="location" size={15} color="#3498DB" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>Lieux sauvegardes</Text>
              <View style={{ marginLeft: 8, backgroundColor: '#EBF5FF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#3498DB' }}>{SAVED_VENUES.length}</Text>
              </View>
            </View>
            {SAVED_VENUES.map(function (venue) {
              var cat = CATEGORIES[venue.category];
              return (
                <View key={venue.id} style={{ flexDirection: 'row', backgroundColor: '#fafafa', borderRadius: 14, marginBottom: 12, overflow: 'hidden' }}>
                  <Image source={venue.image} style={{ width: 90, height: 90 }} resizeMode="cover" />
                  <View style={{ flex: 1, padding: 12, justifyContent: 'center' }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>{venue.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Ionicons name={cat.icon} size={10} color={cat.color} style={{ marginRight: 4 }} />
                      <Text style={{ fontSize: 11, color: cat.color, fontWeight: '600' }}>{cat.label}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <Ionicons name="location-outline" size={11} color="#888" style={{ marginRight: 3 }} />
                      <Text style={{ fontSize: 11, color: '#888' }} numberOfLines={1}>{venue.address}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={{ paddingRight: 14, justifyContent: 'center' }}>
                    <Ionicons name="map-outline" size={20} color="#3498DB" />
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Tab: Journal d'activite */}
        {tab === 'journal' ? (
          <View style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Ionicons name="time" size={15} color="#9B59B6" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>Journal d'activite</Text>
            </View>
            {ACTIVITY.map(function (a, idx) {
              var cat = CATEGORIES[a.category];
              return (
                <View key={a.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 18 }}>
                  {/* Timeline line */}
                  <View style={{ alignItems: 'center', marginRight: 14, width: 36 }}>
                    <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: a.color + '15', justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name={a.icon} size={16} color={a.color} />
                    </View>
                    {idx < ACTIVITY.length - 1 ? (
                      <View style={{ width: 1.5, height: 22, backgroundColor: '#f0f0f0', marginTop: 4 }} />
                    ) : null}
                  </View>
                  <View style={{ flex: 1, paddingTop: 8 }}>
                    <Text style={{ fontSize: 14, color: '#1a1a1a', fontWeight: '500', lineHeight: 20 }}>{a.text}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <View style={{ backgroundColor: cat.color + '15', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginRight: 8 }}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: cat.color }}>{cat.label}</Text>
                      </View>
                      <Text style={{ fontSize: 11, color: '#bbb' }}>{a.time}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Admin entry — visible seulement pour le compte admin */}
        {isAdmin ? (
          <View style={{ marginHorizontal: 20, marginTop: 10, marginBottom: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 20 }}>
            <TouchableOpacity
              onPress={function () { navigation.navigate('Admin'); }}
              style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1117', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14 }}
              activeOpacity={0.8}
            >
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#F5A62320', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
                <Ionicons name="shield-checkmark" size={20} color="#F5A623" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#e6edf3' }}>Panneau Administrateur</Text>
                <Text style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>Gerer les evenements et les listes</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8b949e" />
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
