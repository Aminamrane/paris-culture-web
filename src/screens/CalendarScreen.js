import React from 'react';
import { View, Text, TouchableOpacity, Image, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

var DATA = [
  { title: 'Evenements Aujourd\'hui', data: [
    { id: '1', title: 'Zoo Art Show - Expo Street Art', type: 'Street Art', time: '10h - 19h', venue: 'Paris', image: require('../../assets/events/1.avif') },
    { id: '2', title: 'Paradox Museum', type: 'Musee Immersif', time: '10h - 19h', venue: 'Paris', image: require('../../assets/events/2.avif') },
  ]},
  { title: 'Cette semaine', data: [
    { id: '3', title: 'Science Experiences', type: 'Science', time: '09h30 - 18h30', venue: 'Bercy Village, Paris 12', image: require('../../assets/events/3.avif') },
    { id: '4', title: 'L\'Odyssee Celeste', type: 'Spectacle', time: '19h - 20h30', venue: 'Paris', image: require('../../assets/events/4.avif') },
  ]},
];

export default function CalendarScreen() {
  var insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="person-outline" size={18} color="#333" />
          </View>
          <View style={{ position: 'absolute', top: -2, right: -6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#E85D3A', borderWidth: 2, borderColor: '#fff' }} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1a1a1a' }}>Paris</Text>
          <Ionicons name="chevron-down" size={14} color="#666" style={{ marginLeft: 4 }} />
        </View>
      </View>
      <SectionList
        sections={DATA}
        keyExtractor={function (item) { return item.id; }}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderSectionHeader={function (ref) {
          return (
            <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#1a1a1a', fontStyle: 'italic' }}>{ref.section.title}</Text>
            </View>
          );
        }}
        renderItem={function (ref) {
          var item = ref.item;
          return (
            <TouchableOpacity style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' }}>
              <Image source={item.image} style={{ width: 52, height: 52, borderRadius: 12, marginRight: 14, backgroundColor: '#f0f0f0' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a', fontStyle: 'italic' }} numberOfLines={1}>{item.title}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                  <Text style={{ fontSize: 13, color: '#888' }}>{item.type}</Text>
                  <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#ccc', marginHorizontal: 6 }} />
                  <Text style={{ fontSize: 13, color: '#888' }}>{item.time}</Text>
                </View>
                <Text style={{ fontSize: 13, color: '#aaa', marginTop: 1 }}>{item.venue}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
