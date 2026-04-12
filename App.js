import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Animated, Dimensions, Easing, ScrollView } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Ionicons from '@expo/vector-icons/Ionicons';

import MapScreen from './src/screens/MapScreen';
import ListScreen from './src/screens/ListScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import SearchScreen from './src/screens/SearchScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';
import SubmitEventScreen from './src/screens/SubmitEventScreen';
import AuthScreen from './src/screens/AuthScreen';
import { AdminProvider } from './src/context/AdminContext';
import { AuthProvider } from './src/context/AuthContext';

var W = Dimensions.get('window').width;
var H = Dimensions.get('window').height;

// ─── SPLASH SCREEN ───
function SplashScreen({ onDone }) {
  var logoScale = useRef(new Animated.Value(0.3)).current;
  var logoOpacity = useRef(new Animated.Value(0)).current;
  var taglineOpacity = useRef(new Animated.Value(0)).current;
  var taglineY = useRef(new Animated.Value(20)).current;
  var barWidth = useRef(new Animated.Value(0)).current;
  var barOpacity = useRef(new Animated.Value(0)).current;
  var fadeOut = useRef(new Animated.Value(1)).current;

  useEffect(function () {
    // Logo appears with spring
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(200),
      // Tagline slides up
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(100),
      // Loading bar
      Animated.timing(barOpacity, { toValue: 1, duration: 300, useNativeDriver: false }),
      Animated.timing(barWidth, { toValue: W * 0.5, duration: 1800, easing: Easing.bezier(0.25, 0.1, 0.25, 1), useNativeDriver: false }),
      Animated.delay(200),
      // Fade out
      Animated.timing(fadeOut, { toValue: 0, duration: 400, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start(function () {
      onDone();
    });
  }, []);

  return (
    <Animated.View style={{ flex: 1, backgroundColor: '#0a0e27', justifyContent: 'center', alignItems: 'center', opacity: fadeOut }}>
      <StatusBar style="light" />
      <Animated.View style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
        <Image
          source={require('./assets/events/logo.jpeg')}
          style={{ width: 180, height: 180, borderRadius: 30 }}
        />
      </Animated.View>
      <Animated.Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 24, letterSpacing: 2, opacity: taglineOpacity, transform: [{ translateY: taglineY }] }}>
        DECOUVREZ LA CULTURE PARISIENNE
      </Animated.Text>
      <View style={{ marginTop: 40, height: 3, width: W * 0.5, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
        <Animated.View style={{ height: 3, borderRadius: 2, backgroundColor: '#E85D3A', width: barWidth, opacity: barOpacity }} />
      </View>
    </Animated.View>
  );
}

// ─── ONBOARDING ───
var ONBOARDING_STEPS = [
  {
    title: 'Qu\'est-ce qui\nvous passionne ?',
    subtitle: 'Selectionnez vos centres d\'interet',
    multi: true,
    options: [
      { key: 'expo',        label: 'Expositions & Arts visuels',   icon: 'image-outline' },
      { key: 'theatre',     label: 'Theatre',                       icon: 'sparkles-outline' },
      { key: 'musique',     label: 'Musiques & concerts',           icon: 'musical-notes-outline' },
      { key: 'debats',      label: 'Debats & conferences',          icon: 'mic-outline' },
      { key: 'street',      label: 'Street art',                    icon: 'color-palette-outline' },
      { key: 'litterature', label: 'Litterature & rencontres',      icon: 'book-outline' },
      { key: 'immersif',    label: 'Experiences immersives',        icon: 'glasses-outline' },
    ],
  },
  {
    title: 'Quel type\nd\'experience ?',
    subtitle: 'Dites-nous ce que vous recherchez',
    multi: true,
    options: [
      { key: 'solo', label: 'En solo', icon: 'person-outline' },
      { key: 'amis', label: 'Entre amis', icon: 'people-outline' },
      { key: 'famille', label: 'En famille', icon: 'heart-outline' },
      { key: 'romantique', label: 'Romantique', icon: 'rose-outline' },
      { key: 'pleinair', label: 'En plein air', icon: 'sunny-outline' },
      { key: 'nocturne', label: 'Nocturne', icon: 'moon-outline' },
    ],
  },
  {
    title: 'A quelle frequence\nsortez-vous ?',
    subtitle: 'Pour mieux personnaliser vos recommandations',
    multi: false,
    options: [
      { key: 'daily', label: 'Presque tous les jours', icon: 'flame-outline' },
      { key: 'weekly', label: 'Plusieurs fois par semaine', icon: 'trending-up-outline' },
      { key: 'weekend', label: 'Le week-end', icon: 'calendar-outline' },
      { key: 'occasional', label: 'Occasionnellement', icon: 'time-outline' },
    ],
  },
];

function OnboardingScreen({ onDone }) {
  var insets = useSafeAreaInsets();
  var _s1 = useState(0); var step = _s1[0]; var setStep = _s1[1];
  var _s2 = useState({}); var selections = _s2[0]; var setSelections = _s2[1];
  var slideAnim = useRef(new Animated.Value(0)).current;
  var fadeAnim = useRef(new Animated.Value(1)).current;

  var current = ONBOARDING_STEPS[step];
  var currentSelections = selections[step] || [];

  function toggleOption(key) {
    var sel = currentSelections.slice();
    if (current.multi) {
      var idx = sel.indexOf(key);
      if (idx >= 0) { sel.splice(idx, 1); } else { sel.push(key); }
    } else {
      sel = [key];
    }
    var next = {};
    for (var k in selections) { next[k] = selections[k]; }
    next[step] = sel;
    setSelections(next);
  }

  function goNext() {
    if (step < ONBOARDING_STEPS.length - 1) {
      // Slide out left, then slide in from right
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -40, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
      ]).start(function () {
        setStep(step + 1);
        slideAnim.setValue(40);
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
        ]).start();
      });
    } else {
      // Final fade out — pass step 0 (category) selections as userPrefs
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(function () {
        onDone(selections[0] || []);
      });
    }
  }

  var canContinue = currentSelections.length > 0;
  var isLast = step === ONBOARDING_STEPS.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#0a0e27' }}>
      <StatusBar style="light" />
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateX: slideAnim }] }}>
        {/* Progress dots - fixed top */}
        <View style={{ paddingTop: insets.top + 16, paddingBottom: 12, paddingHorizontal: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {ONBOARDING_STEPS.map(function (_, i) {
              var active = i === step;
              var done = i < step;
              return (
                <View key={i} style={{ width: active ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: active ? '#E85D3A' : done ? 'rgba(232,93,58,0.5)' : 'rgba(255,255,255,0.15)', marginHorizontal: 4 }} />
              );
            })}
          </View>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* Title */}
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', lineHeight: 36, marginBottom: 6, marginTop: 8 }}>{current.title}</Text>
          <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 }}>{current.subtitle}</Text>

          {/* Options - full width list */}
          {current.options.map(function (opt, idx) {
            var selected = currentSelections.indexOf(opt.key) >= 0;
            return (
              <AnimatedOption
                key={opt.key}
                opt={opt}
                selected={selected}
                onPress={function () { toggleOption(opt.key); }}
                width={W - 48}
                delay={idx * 60}
                fullWidth={true}
              />
            );
          })}
        </ScrollView>

        {/* Fixed bottom buttons */}
        <View style={{ paddingHorizontal: 24, paddingTop: 12, paddingBottom: insets.bottom + 16, backgroundColor: '#0a0e27' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity onPress={function () { onDone([]); }} style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>Passer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={canContinue ? goNext : undefined}
              activeOpacity={canContinue ? 0.7 : 1}
              style={{ paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, backgroundColor: canContinue ? '#E85D3A' : 'rgba(255,255,255,0.08)' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: canContinue ? '#fff' : 'rgba(255,255,255,0.25)' }}>
                {isLast ? 'C\'est parti !' : 'Continuer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

function AnimatedOption(props) {
  var scaleAnim = useRef(new Animated.Value(0.85)).current;
  var opacityAnim = useRef(new Animated.Value(0)).current;
  var bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(function () {
    Animated.sequence([
      Animated.delay(props.delay),
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  function handlePress() {
    Animated.sequence([
      Animated.timing(bounceAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.spring(bounceAnim, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
    ]).start();
    props.onPress();
  }

  return (
    <Animated.View style={{ opacity: opacityAnim, transform: [{ scale: Animated.multiply(scaleAnim, bounceAnim) }], width: props.width, marginBottom: 12, marginRight: props.fullWidth ? 0 : 12 }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 18,
          borderRadius: 16,
          backgroundColor: props.selected ? 'rgba(232,93,58,0.15)' : 'rgba(255,255,255,0.06)',
          borderWidth: 1.5,
          borderColor: props.selected ? '#E85D3A' : 'rgba(255,255,255,0.08)',
        }}
      >
        <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: props.selected ? 'rgba(232,93,58,0.2)' : 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center', marginRight: 14 }}>
          <Ionicons name={props.opt.icon} size={20} color={props.selected ? '#E85D3A' : 'rgba(255,255,255,0.5)'} />
        </View>
        <Text style={{ fontSize: 15, fontWeight: '600', color: props.selected ? '#fff' : 'rgba(255,255,255,0.6)', flex: 1 }}>{props.opt.label}</Text>
        {props.selected ? (
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: '#E85D3A', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark" size={16} color="#fff" />
          </View>
        ) : (
          <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' }} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── TAB BAR ───
function TabBar(props) {
  var insets = useSafeAreaInsets();
  var tabs = [
    { key: 'map', label: 'Carte', icon: 'map-outline', iconActive: 'map' },
    { key: 'list', label: 'Liste', icon: 'list-outline', iconActive: 'list' },
    { key: 'social', label: 'Social', icon: 'people-outline', iconActive: 'people' },
    { key: 'agenda', label: 'Agenda', icon: 'calendar-outline', iconActive: 'calendar' },
    { key: 'search', label: 'Chercher', icon: 'search-outline', iconActive: 'search' },
  ];
  return (
    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 + insets.bottom, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0', flexDirection: 'row', paddingTop: 6, paddingBottom: insets.bottom }}>
      {tabs.map(function (t) {
        var active = props.active === t.key;
        return (
          <TouchableOpacity key={t.key} onPress={function () { props.onPress(t.key); }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name={active ? t.iconActive : t.icon} size={22} color={active ? '#E85D3A' : '#999'} />
            <Text style={{ fontSize: 10, marginTop: 2, color: active ? '#E85D3A' : '#999', fontWeight: active ? '700' : '400' }}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── MAIN APP ───
function AppContent({ userPrefs, currentUser }) {
  var _s1 = useState('map'); var tab = _s1[0]; var setTab = _s1[1];
  var _s2 = useState(null); var screen = _s2[0]; var setScreen = _s2[1];
  var _s3 = useState(null); var screenData = _s3[0]; var setScreenData = _s3[1];
  var fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.timing(fadeIn, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []);

  var nav = {
    navigate: function (name, params) {
      setScreen(name);
      setScreenData(params || null);
    },
    goBack: function () {
      setScreen(null);
      setScreenData(null);
    },
  };

  if (screen === 'EventDetail' && screenData) {
    return <EventDetailScreen route={{ params: screenData }} navigation={nav} />;
  }
  if (screen === 'Profil') {
    return <ProfileScreen navigation={nav} currentUser={currentUser} />;
  }
  if (screen === 'Admin') {
    return <AdminScreen navigation={nav} />;
  }
  if (screen === 'SubmitEvent') {
    return <SubmitEventScreen navigation={nav} />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeIn }}>
      {tab === 'map' ? <MapScreen navigation={nav} userPrefs={userPrefs} /> : null}
      {tab === 'list' ? <ListScreen navigation={nav} userPrefs={userPrefs} /> : null}
      {tab === 'social' ? <CommunityScreen navigation={nav} /> : null}
      {tab === 'agenda' ? <CalendarScreen navigation={nav} /> : null}
      {tab === 'search' ? <SearchScreen navigation={nav} /> : null}
      <TabBar active={tab} onPress={setTab} />
    </Animated.View>
  );
}

// ─── ROOT ───
export default function App() {
  var _s1 = useState('splash'); var phase = _s1[0]; var setPhase = _s1[1];
  var _s2 = useState([]); var userPrefs = _s2[0]; var setUserPrefs = _s2[1];
  var _s3 = useState(null); var authUser = _s3[0]; var setAuthUser = _s3[1];
  var _s4 = useState(false); var hasOnboarded = _s4[0]; var setHasOnboarded = _s4[1];

  function handleAuthSuccess(user) {
    setAuthUser(user);
    // Admin skips onboarding, users who already onboarded skip it too
    if (!hasOnboarded) {
      setPhase('onboarding');
    } else {
      setPhase('app');
    }
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AdminProvider>
          {phase === 'splash' ? (
            <SplashScreen onDone={function () { setPhase('auth'); }} />
          ) : phase === 'auth' ? (
            <>
              <StatusBar style="light" />
              <AuthScreen onSuccess={handleAuthSuccess} />
            </>
          ) : phase === 'onboarding' ? (
            <OnboardingScreen onDone={function (prefs) { setUserPrefs(prefs || []); setHasOnboarded(true); setPhase('app'); }} />
          ) : (
            <>
              <StatusBar style="dark" />
              <AppContent userPrefs={userPrefs} currentUser={authUser} />
            </>
          )}
        </AdminProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
