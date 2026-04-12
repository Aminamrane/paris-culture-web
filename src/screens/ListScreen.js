import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, TextInput, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EVENTS } from '../data/events';
import { CATEGORIES } from '../data/categories';
import { useAdmin } from '../context/AdminContext';

var W = Dimensions.get('window').width;

function EventCard({ item, navigation }) {
  var cat = CATEGORIES[item.category];
  return (
    <TouchableOpacity
      onPress={function () { navigation.navigate('EventDetail', { event: item }); }}
      style={{ backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 }}
      activeOpacity={0.85}
    >
      <Image source={item.image} style={{ width: '100%', height: 160, borderTopLeftRadius: 16, borderTopRightRadius: 16 }} resizeMode="cover" />
      <View style={{ padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ backgroundColor: cat.color + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name={cat.icon} size={11} color={cat.color} style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 11, fontWeight: '600', color: cat.color }}>{cat.label}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 17, fontWeight: '700', color: '#1a1a1a' }}>{item.title}</Text>
        <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }} numberOfLines={1}>{item.subtitle}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="calendar-outline" size={12} color="#888" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#888' }}>{item.date}</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: cat.color }}>{item.price}</Text>
        </View>
        <View style={{ flexDirection: 'row', marginTop: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 14 }}>
            <Ionicons name="people-outline" size={12} color="#aaa" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#aaa' }}>{item.attendees} personnes</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="chatbubble-outline" size={11} color="#aaa" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, color: '#aaa' }}>{item.comments.length} avis</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function EmptyList({ label }) {
  return (
    <View style={{ alignItems: 'center', paddingTop: 60, paddingBottom: 40 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
        <Ionicons name="calendar-outline" size={32} color="#ddd" />
      </View>
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#ccc' }}>Aucun evenement</Text>
      <Text style={{ fontSize: 13, color: '#ddd', marginTop: 6 }}>{label}</Text>
    </View>
  );
}

export default function ListScreen({ navigation, userPrefs }) {
  var insets = useSafeAreaInsets();
  var { config } = useAdmin();
  var _s1 = useState('pour-toi'); var activeTab = _s1[0]; var setActiveTab = _s1[1];
  var _s2 = useState(''); var search = _s2[0]; var setSearch = _s2[1];

  var pourToi = useMemo(function () {
    if (!userPrefs || userPrefs.length === 0) return EVENTS;
    var matched = EVENTS.filter(function (e) { return userPrefs.indexOf(e.category) >= 0; });
    return matched.length > 0 ? matched : EVENTS;
  }, [userPrefs]);

  var autour = EVENTS.filter(function (e) {
    return config[e.id] && config[e.id].lists.indexOf('autour') >= 0;
  });

  var tendances = EVENTS.filter(function (e) {
    return config[e.id] && config[e.id].lists.indexOf('tendances') >= 0;
  });

  var currentList = activeTab === 'pour-toi' ? pourToi : activeTab === 'autour' ? autour : tendances;

  var filtered = search
    ? currentList.filter(function (e) {
        return e.title.toLowerCase().indexOf(search.toLowerCase()) >= 0
          || e.subtitle.toLowerCase().indexOf(search.toLowerCase()) >= 0;
      })
    : currentList;

  var TABS = [
    { key: 'pour-toi', label: 'Pour toi', icon: 'sparkles-outline', color: '#E85D3A' },
    { key: 'autour', label: 'Autour de toi', icon: 'navigate-circle-outline', color: '#3B82F6' },
    { key: 'tendances', label: 'Tendances', icon: 'trending-up-outline', color: '#A855F7' },
  ];

  var emptyLabels = {
    'pour-toi': 'Completez votre profil pour des recommandations',
    'autour': "Aucun evenement pres de vous pour l'instant",
    'tendances': 'Revenez bientot pour voir les tendances',
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8fc', paddingTop: insets.top }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10, backgroundColor: '#f8f8fc' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#1a1a1a' }}>Evenements</Text>
          <TouchableOpacity
            onPress={function () { navigation.navigate('SubmitEvent'); }}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#E85D3A', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={16} color="#fff" style={{ marginRight: 4 }} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Proposer</Text>
          </TouchableOpacity>
        </View>
        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginTop: 12, borderRadius: 14, paddingHorizontal: 14, height: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 }}>
          <Ionicons name="search-outline" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput
            style={{ flex: 1, fontSize: 15, color: '#333' }}
            placeholder="Rechercher un evenement..."
            placeholderTextColor="#bbb"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={function () { setSearch(''); }}>
              <Ionicons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* 3 Tabs */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
          {TABS.map(function (t) {
            var active = activeTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                onPress={function () { setActiveTab(t.key); setSearch(''); }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderRadius: 22,
                  backgroundColor: active ? t.color : '#f5f5f5',
                  marginRight: 10,
                  shadowColor: active ? t.color : 'transparent',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: active ? 0.3 : 0,
                  shadowRadius: 8,
                }}
                activeOpacity={0.75}
              >
                <Ionicons name={t.icon} size={14} color={active ? '#fff' : t.color} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: active ? '#fff' : '#555' }}>{t.label}</Text>
                <View style={{ marginLeft: 8, backgroundColor: active ? 'rgba(255,255,255,0.25)' : t.color + '18', paddingHorizontal: 7, paddingVertical: 1, borderRadius: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: active ? '#fff' : t.color }}>
                    {t.key === 'pour-toi' ? pourToi.length : t.key === 'autour' ? autour.length : tendances.length}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active tab label */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 }}>
        {activeTab === 'pour-toi' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="sparkles" size={13} color="#E85D3A" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#888', fontWeight: '500' }}>
              Selectionnes d'apres vos centres d'interet
            </Text>
          </View>
        ) : activeTab === 'autour' ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="navigate-circle-outline" size={13} color="#3B82F6" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#888', fontWeight: '500' }}>
              Evenements pres de vous a Paris
            </Text>
          </View>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="trending-up-outline" size={13} color="#A855F7" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#888', fontWeight: '500' }}>
              Les evenements du moment a Paris
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={function (item) { return item.id; }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        renderItem={function (ref) {
          return <EventCard item={ref.item} navigation={navigation} />;
        }}
        ListEmptyComponent={<EmptyList label={emptyLabels[activeTab]} />}
      />
    </View>
  );
}
