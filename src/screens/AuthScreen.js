import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Image, Animated, Easing, Dimensions, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

var W = Dimensions.get('window').width;

export default function AuthScreen({ onSuccess }) {
  var insets = useSafeAreaInsets();
  var { login, signup } = useAuth();

  var _s1 = useState('login'); var mode = _s1[0]; var setMode = _s1[1];
  var _s2 = useState(''); var name = _s2[0]; var setName = _s2[1];
  var _s3 = useState(''); var email = _s3[0]; var setEmail = _s3[1];
  var _s4 = useState(''); var password = _s4[0]; var setPassword = _s4[1];
  var _s5 = useState(false); var showPass = _s5[0]; var setShowPass = _s5[1];
  var _s6 = useState(''); var error = _s6[0]; var setError = _s6[1];
  var _s7 = useState(false); var loading = _s7[0]; var setLoading = _s7[1];

  var logoOpacity = useRef(new Animated.Value(0)).current;
  var logoY = useRef(new Animated.Value(-30)).current;
  var formOpacity = useRef(new Animated.Value(0)).current;
  var formY = useRef(new Animated.Value(30)).current;
  var tabAnim = useRef(new Animated.Value(0)).current;
  var shakeAnim = useRef(new Animated.Value(0)).current;
  var loadingDot = useRef(new Animated.Value(0)).current;

  useEffect(function () {
    Animated.sequence([
      Animated.delay(100),
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(logoY, { toValue: 0, friction: 7, tension: 40, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(formOpacity, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.spring(formY, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  function switchMode(m) {
    setMode(m);
    setError('');
    Animated.spring(tabAnim, { toValue: m === 'login' ? 0 : 1, friction: 7, tension: 50, useNativeDriver: false }).start();
  }

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function handleSubmit() {
    setError('');
    if (mode === 'login') {
      if (!email.trim() || !password) { setError('Remplissez tous les champs.'); shake(); return; }
    } else {
      if (!name.trim() || !email.trim() || !password) { setError('Remplissez tous les champs.'); shake(); return; }
      if (password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caracteres.'); shake(); return; }
    }
    setLoading(true);
    // Simulate network delay
    Animated.loop(Animated.timing(loadingDot, { toValue: 1, duration: 800, useNativeDriver: true })).start();
    setTimeout(function () {
      loadingDot.stopAnimation();
      var result = mode === 'login'
        ? login(email.trim(), password)
        : signup(name.trim(), email.trim(), password);
      setLoading(false);
      if (result.success) {
        onSuccess(result.user);
      } else {
        setError(result.error);
        shake();
      }
    }, 900);
  }

  var tabIndicatorLeft = tabAnim.interpolate({ inputRange: [0, 1], outputRange: [4, (W - 48) / 2 + 4] });
  var tabIndicatorWidth = (W - 48) / 2 - 8;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={{ flex: 1, backgroundColor: '#0a0e27' }}
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 }}>

          {/* Logo + Titre */}
          <Animated.View style={{ alignItems: 'center', marginBottom: 40, opacity: logoOpacity, transform: [{ translateY: logoY }] }}>
            <Image
              source={require('../../assets/events/logo.jpeg')}
              style={{ width: 80, height: 80, borderRadius: 20, marginBottom: 16 }}
            />
            <Text style={{ fontSize: 30, fontWeight: '900', color: '#fff', letterSpacing: -0.5 }}>Lumina</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', marginTop: 6, letterSpacing: 1.5 }}>CULTURE PARISIENNE</Text>
          </Animated.View>

          {/* Formulaire */}
          <Animated.View style={{ opacity: formOpacity, transform: [{ translateY: formY }] }}>

            {/* Tab switcher */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 16, padding: 4, marginBottom: 28, position: 'relative' }}>
              <Animated.View style={{
                position: 'absolute', top: 4, left: tabIndicatorLeft,
                width: tabIndicatorWidth, bottom: 4,
                backgroundColor: '#2563EB', borderRadius: 12,
              }} />
              <TouchableOpacity onPress={function () { switchMode('login'); }} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 }} activeOpacity={0.7}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: mode === 'login' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Connexion</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={function () { switchMode('signup'); }} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', zIndex: 1 }} activeOpacity={0.7}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: mode === 'signup' ? '#fff' : 'rgba(255,255,255,0.4)' }}>Inscription</Text>
              </TouchableOpacity>
            </View>

            {/* Champs */}
            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
              {mode === 'signup' ? (
                <AuthField
                  icon="person-outline"
                  placeholder="Nom complet"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              ) : null}
              <AuthField
                icon="mail-outline"
                placeholder="Adresse email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AuthField
                icon="lock-closed-outline"
                placeholder="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
                onRightPress={function () { setShowPass(!showPass); }}
              />

              {/* Erreur */}
              {error ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,68,68,0.12)', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,68,68,0.25)' }}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 13, color: '#FF6B6B', flex: 1 }}>{error}</Text>
                </View>
              ) : null}

              {/* Bouton principal */}
              <TouchableOpacity
                onPress={loading ? undefined : handleSubmit}
                activeOpacity={0.8}
                style={{ backgroundColor: '#2563EB', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 4, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16 }}
              >
                {loading ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="reload-outline" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Chargement...</Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>
                    {mode === 'login' ? 'Se connecter' : 'Creer mon compte'}
                  </Text>
                )}
              </TouchableOpacity>

              {mode === 'login' ? (
                <TouchableOpacity style={{ alignItems: 'center', marginTop: 16 }}>
                  <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', fontWeight: '500' }}>Mot de passe oublie ?</Text>
                </TouchableOpacity>
              ) : null}
            </Animated.View>

            {/* Séparateur */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 24 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', marginHorizontal: 12 }}>ou</Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </View>

            {/* Continuer sans compte */}
            <TouchableOpacity
              onPress={function () { onSuccess(null); }}
              style={{ borderRadius: 16, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.04)' }}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', fontWeight: '500' }}>Continuer sans compte</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 24, lineHeight: 16 }}>
              En continuant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialite.
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthField({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightPress }) {
  var _s = useState(false); var focused = _s[0]; var setFocused = _s[1];
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      backgroundColor: focused ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
      borderRadius: 16, paddingHorizontal: 16, height: 56,
      marginBottom: 14, borderWidth: 1.5,
      borderColor: focused ? 'rgba(37,99,235,0.5)' : 'rgba(255,255,255,0.08)',
    }}>
      <Ionicons name={icon} size={18} color={focused ? '#2563EB' : 'rgba(255,255,255,0.35)'} style={{ marginRight: 12 }} />
      <TextInput
        style={{ flex: 1, fontSize: 15, color: '#fff' }}
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.25)"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || 'default'}
        autoCapitalize={autoCapitalize || 'none'}
        onFocus={function () { setFocused(true); }}
        onBlur={function () { setFocused(false); }}
        autoCorrect={false}
      />
      {rightIcon ? (
        <TouchableOpacity onPress={onRightPress} style={{ padding: 4 }}>
          <Ionicons name={rightIcon} size={18} color="rgba(255,255,255,0.35)" />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
