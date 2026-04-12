import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, FlatList, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EVENTS } from '../data/events';

var TRENDING = ['Art contemporain', 'Vernissage', 'Photographie', 'Sculpture', 'Performance', 'Street art'];
var PLACES = [
  { id: '1', title: 'Grand Palais', cat: 'Exposition', image: 'https://picsum.photos/seed/grandpalais/100/100' },
  { id: '2', title: 'Centre Pompidou', cat: 'Musee', image: 'https://picsum.photos/seed/pompidou/100/100' },
  { id: '3', title: 'Palais de Tokyo', cat: 'Art Contemporain', image: 'https://picsum.photos/seed/tokyo/100/100' },
  { id: '4', title: "Musee d'Orsay", cat: 'Musee', image: 'https://picsum.photos/seed/orsay/100/100' },
];

export default function SearchScreen({ navigation }) {
  var insets = useSafeAreaInsets();
  var _s = useState(''); var query = _s[0]; var setQuery = _s[1];

  var results = query.trim() ? EVENTS.filter(function (e) {
    var q = query.toLowerCase();
    return e.title.toLowerCase().indexOf(q) >= 0 || e.category.toLowerCase().indexOf(q) >= 0;
  }) : [];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginTop: 16, marginBottom: 14 }}>Rechercher</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 14, paddingHorizontal: 14, height: 46 }}>
          <Ionicons name="search-outline" size={16} color="#999" style={{ marginRight: 8 }} />
          <TextInput style={{ flex: 1, fontSize: 15, color: '#333' }} placeholder="Lieux, evenements, artistes..." placeholderTextColor="#999" value={query} onChangeText={setQuery} />
          {query.length > 0 ? (
            <TouchableOpacity onPress={function () { setQuery(''); }}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {query.trim() ? (
        <FlatList
          data={results}
          keyExtractor={function (item) { return item.id; }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Ionicons name="search" size={40} color="#ddd" />
              <Text style={{ fontSize: 15, color: '#999', marginTop: 12 }}>Aucun resultat pour "{query}"</Text>
            </View>
          }
          renderItem={function (ref) {
            var item = ref.item;
            return (
              <TouchableOpacity onPress={function () { navigation.navigate('EventDetail', { event: item }); }} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
                <Image source={{ uri: item.thumbnail }} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>{item.title}</Text>
                  <Text style={{ fontSize: 12, color: '#E85D3A', fontWeight: '600', marginTop: 2 }}>{item.category}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            );
          }}
        />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>Tendances</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20 }}>
            {TRENDING.map(function (tag, i) {
              return (
                <TouchableOpacity key={i} onPress={function () { setQuery(tag); }} style={{ backgroundColor: '#FFF0EC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: '#E85D3A' }}>{tag}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={{ fontSize: 20, fontWeight: '700', color: '#1a1a1a', paddingHorizontal: 20, marginTop: 24, marginBottom: 12 }}>Lieux populaires</Text>
          {PLACES.map(function (place) {
            return (
              <TouchableOpacity key={place.id} style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 }}>
                <Image source={{ uri: place.image }} style={{ width: 50, height: 50, borderRadius: 12, marginRight: 14 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#1a1a1a' }}>{place.title}</Text>
                  <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>{place.cat}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
