import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated, Easing, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { CATEGORIES } from '../data/categories';

var W = Dimensions.get('window').width;

var STEPS = ['Informations', 'Details', 'Confirmation'];

export default function SubmitEventScreen({ navigation }) {
  var insets = useSafeAreaInsets();
  var _s1 = useState(0); var step = _s1[0]; var setStep = _s1[1];
  var _s2 = useState(''); var title = _s2[0]; var setTitle = _s2[1];
  var _s3 = useState(''); var date = _s3[0]; var setDate = _s3[1];
  var _s4 = useState(''); var address = _s4[0]; var setAddress = _s4[1];
  var _s5 = useState(''); var description = _s5[0]; var setDescription = _s5[1];
  var _s6 = useState(''); var category = _s6[0]; var setCategory = _s6[1];
  var _s7 = useState(''); var price = _s7[0]; var setPrice = _s7[1];
  var _s8 = useState(''); var time = _s8[0]; var setTime = _s8[1];
  var _s9 = useState(false); var submitted = _s9[0]; var setSubmitted = _s9[1];
  var successScale = useRef(new Animated.Value(0)).current;
  var successOpacity = useRef(new Animated.Value(0)).current;

  function goNext() {
    if (step < 2) { setStep(step + 1); }
  }

  function goPrev() {
    if (step > 0) { setStep(step - 1); }
  }

  function handleSubmit() {
    setSubmitted(true);
    Animated.parallel([
      Animated.spring(successScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
      Animated.timing(successOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }

  var canNext1 = title.length > 2 && category.length > 0;
  var canNext2 = date.length > 2 && address.length > 2 && description.length > 10;

  if (submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
        <Animated.View style={{ alignItems: 'center', opacity: successOpacity, transform: [{ scale: successScale }] }}>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#4ADE8015', justifyContent: 'center', alignItems: 'center', marginBottom: 24 }}>
            <Ionicons name="checkmark-circle" size={56} color="#4ADE80" />
          </View>
          <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a1a1a', textAlign: 'center' }}>Proposition envoyee !</Text>
          <Text style={{ fontSize: 15, color: '#888', textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
            Votre evenement a ete soumis et sera examine par notre equipe. Vous serez notifie une fois valide.
          </Text>
          <View style={{ backgroundColor: '#f8f8f8', borderRadius: 16, padding: 20, marginTop: 28, width: '100%' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="time-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: '#555', fontWeight: '600' }}>Delai de validation : 24-48h</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#2563EB" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 13, color: '#555', fontWeight: '600' }}>Verifie par l'equipe Lumina</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={function () { navigation.goBack(); }}
            style={{ marginTop: 32, backgroundColor: '#2563EB', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16 }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Retour a l'accueil</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={function () { navigation.goBack(); }} style={{ marginRight: 14 }}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: '#1a1a1a' }}>Proposer un evenement</Text>
            <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}>Etape {step + 1} sur {STEPS.length} — {STEPS[step]}</Text>
          </View>
        </View>
        {/* Progress bar */}
        <View style={{ height: 4, backgroundColor: '#f0f0f0', borderRadius: 2, marginTop: 14 }}>
          <View style={{ height: 4, backgroundColor: '#2563EB', borderRadius: 2, width: ((step + 1) / STEPS.length) * (W - 40) }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Step 1: Infos de base */}
        {step === 0 ? (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 }}>Informations principales</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 }}>Dites-nous l'essentiel sur votre evenement</Text>

            <FormField label="Titre de l'evenement *" icon="text-outline">
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}
                placeholder="Ex: Concert Jazz au Caveau..."
                placeholderTextColor="#bbb"
                value={title}
                onChangeText={setTitle}
              />
            </FormField>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 10, marginTop: 4 }}>Categorie *</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {Object.keys(CATEGORIES).map(function (k) {
                var cat = CATEGORIES[k];
                var sel = category === k;
                return (
                  <TouchableOpacity
                    key={k}
                    onPress={function () { setCategory(k); }}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: sel ? cat.color : '#f5f5f5', marginRight: 8, marginBottom: 8, borderWidth: 1.5, borderColor: sel ? cat.color : 'transparent' }}
                    activeOpacity={0.75}
                  >
                    <Ionicons name={cat.icon} size={12} color={sel ? '#fff' : cat.color} style={{ marginRight: 5 }} />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: sel ? '#fff' : '#555' }}>{cat.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <FormField label="Prix" icon="pricetag-outline" style={{ marginTop: 8 }}>
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}
                placeholder="Ex: 15 EUR, Gratuit..."
                placeholderTextColor="#bbb"
                value={price}
                onChangeText={setPrice}
              />
            </FormField>
          </View>
        ) : null}

        {/* Step 2: Details */}
        {step === 1 ? (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 }}>Lieu & date</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 }}>Ou et quand se deroule votre evenement ?</Text>

            <FormField label="Date *" icon="calendar-outline">
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}
                placeholder="Ex: 25 Avr 2026..."
                placeholderTextColor="#bbb"
                value={date}
                onChangeText={setDate}
              />
            </FormField>

            <FormField label="Heure" icon="time-outline">
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}
                placeholder="Ex: 19h00 - 21h00"
                placeholderTextColor="#bbb"
                value={time}
                onChangeText={setTime}
              />
            </FormField>

            <FormField label="Adresse *" icon="location-outline">
              <TextInput
                style={{ flex: 1, fontSize: 15, color: '#1a1a1a' }}
                placeholder="Adresse complete..."
                placeholderTextColor="#bbb"
                value={address}
                onChangeText={setAddress}
              />
            </FormField>

            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 4 }}>Description *</Text>
            <View style={{ backgroundColor: '#f8f8f8', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: description.length > 10 ? '#2563EB20' : '#f0f0f0' }}>
              <TextInput
                style={{ fontSize: 15, color: '#1a1a1a', minHeight: 120, textAlignVertical: 'top', lineHeight: 22 }}
                placeholder="Decrivez votre evenement : programme, artistes, atmosphere..."
                placeholderTextColor="#bbb"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            <Text style={{ fontSize: 11, color: '#bbb', marginTop: 6, textAlign: 'right' }}>{description.length} caracteres (min. 10)</Text>
          </View>
        ) : null}

        {/* Step 3: Recap */}
        {step === 2 ? (
          <View>
            <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 }}>Recapitulatif</Text>
            <Text style={{ fontSize: 14, color: '#888', marginBottom: 24, lineHeight: 20 }}>Verifiez les informations avant d'envoyer</Text>

            <View style={{ backgroundColor: '#f8f8f8', borderRadius: 18, overflow: 'hidden', marginBottom: 20 }}>
              {category ? (
                <View style={{ backgroundColor: CATEGORIES[category].color, padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={CATEGORIES[category].icon} size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>{CATEGORIES[category].label}</Text>
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', marginTop: 6 }}>{title}</Text>
                </View>
              ) : null}

              <View style={{ padding: 16 }}>
                {[
                  { icon: 'calendar-outline', label: 'Date', value: date },
                  { icon: 'time-outline', label: 'Heure', value: time || 'Non renseigne' },
                  { icon: 'location-outline', label: 'Adresse', value: address },
                  { icon: 'pricetag-outline', label: 'Prix', value: price || 'Non renseigne' },
                ].map(function (row, i) {
                  return (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, borderBottomWidth: i < 3 ? 1 : 0, borderBottomColor: '#f0f0f0' }}>
                      <Ionicons name={row.icon} size={15} color="#2563EB" style={{ marginRight: 12, marginTop: 1 }} />
                      <Text style={{ fontSize: 12, color: '#999', width: 60, fontWeight: '500' }}>{row.label}</Text>
                      <Text style={{ flex: 1, fontSize: 13, color: '#1a1a1a', fontWeight: '600', lineHeight: 20 }}>{row.value}</Text>
                    </View>
                  );
                })}
                {description ? (
                  <View style={{ paddingTop: 12 }}>
                    <Text style={{ fontSize: 12, color: '#999', fontWeight: '500', marginBottom: 6 }}>Description</Text>
                    <Text style={{ fontSize: 13, color: '#555', lineHeight: 20 }}>{description}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={{ backgroundColor: '#FFF8EC', borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'flex-start' }}>
              <Ionicons name="information-circle" size={18} color="#F5A623" style={{ marginRight: 10, marginTop: 1 }} />
              <Text style={{ flex: 1, fontSize: 13, color: '#555', lineHeight: 20 }}>
                Votre evenement sera examine par l'equipe Lumina avant d'etre publie. Ce processus prend generalement 24 a 48 heures.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom buttons */}
      <View style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 16, paddingTop: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {step > 0 ? (
            <TouchableOpacity onPress={goPrev} style={{ paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: '#f5f5f5', marginRight: 12 }}>
              <Ionicons name="arrow-back" size={20} color="#555" />
            </TouchableOpacity>
          ) : null}
          {step < 2 ? (
            <TouchableOpacity
              onPress={(step === 0 && canNext1) || (step === 1 && canNext2) ? goNext : undefined}
              activeOpacity={((step === 0 && canNext1) || (step === 1 && canNext2)) ? 0.75 : 1}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: ((step === 0 && canNext1) || (step === 1 && canNext2)) ? '#2563EB' : '#f0f0f0', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 16, fontWeight: '700', color: ((step === 0 && canNext1) || (step === 1 && canNext2)) ? '#fff' : '#ccc' }}>Continuer</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={handleSubmit}
              style={{ flex: 1, paddingVertical: 16, borderRadius: 14, backgroundColor: '#2563EB', alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Envoyer la proposition</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function FormField({ label, icon, children, style }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 14, paddingHorizontal: 14, height: 52, borderWidth: 1.5, borderColor: '#f0f0f0' }}>
        <Ionicons name={icon} size={16} color="#999" style={{ marginRight: 10 }} />
        {children}
      </View>
    </View>
  );
}
