import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

var W = Dimensions.get('window').width;

var FRIENDS = [
  { id: '1', user: 'Sacha', event: 'Zoo Art Show', comment: 'INCROYABLE 500 artistes dans un immeuble entier !!', time: '2j' },
  { id: '2', user: 'Youcef Amrane', event: 'Paradox Museum', comment: 'La salle Zero Gravite c\'est completement dingue', time: '3j' },
  { id: '3', user: 'Sacha', event: 'L\'Odyssee Celeste', comment: 'Le mapping 3D avec le choeur en live, frissons garantis', time: '5j' },
  { id: '4', user: 'Youcef Amrane', event: 'Science Experiences', comment: 'La nouvelle salle Everest vaut le detour', time: '6j' },
];

var EXHIBITIONS = [
  { id: '1', title: 'ZOO ART SHOW', venue: 'Expo Street Art Paris', dist: '1 200m', image: require('../../assets/events/1.avif') },
  { id: '2', title: 'L\'ODYSSEE CELESTE', venue: 'Spectacle mapping 3D', dist: '800m', image: require('../../assets/events/4.avif') },
];

export default function CommunityScreen() {
  var insets = useSafeAreaInsets();
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }} contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
        <View>
          <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="person-outline" size={18} color="#333" />
          </View>
          <View style={{ position: 'absolute', top: -2, right: -6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563EB', borderWidth: 2, borderColor: '#fff' }} />
        </View>
        <TouchableOpacity>
          <Ionicons name="person-add-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, backgroundColor: '#f8f8f8', borderRadius: 14, padding: 12, marginBottom: 20 }}>
        <View style={{ width: 50, height: 50, borderRadius: 12, backgroundColor: '#FFF0EC', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
          <Ionicons name="heart" size={22} color="#2563EB" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1a1a1a' }}>Vos coups de coeur sont prets !</Text>
          <Text style={{ fontSize: 12, color: '#888', marginTop: 2 }}>4 experiences selectionnees pour vous</Text>
        </View>
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 12 }}>Amis</Text>

      {FRIENDS.map(function (item) {
        return (
          <TouchableOpacity key={item.id} style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
              <Ionicons name="person" size={20} color="#999" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: '#444', lineHeight: 19 }}>
                <Text style={{ fontWeight: '700', color: '#1a1a1a' }}>{item.user}</Text>
                <Text> a laisse une note sur </Text>
                <Text style={{ fontWeight: '700', color: '#1a1a1a' }}>{item.event}</Text>
                <Text> : {item.comment}  </Text>
                <Text style={{ color: '#bbb', fontSize: 12 }}>{item.time}</Text>
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }}>
        <Text style={{ fontSize: 13, color: '#888' }}>Voir plus</Text>
        <Ionicons name="chevron-down" size={14} color="#888" />
      </TouchableOpacity>

      <Text style={{ fontSize: 24, fontWeight: '800', color: '#1a1a1a', paddingHorizontal: 20, marginBottom: 12, marginTop: 8 }}>Decouvrir</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {EXHIBITIONS.map(function (item) {
          return (
            <TouchableOpacity key={item.id} style={{ width: W * 0.6, height: 280, borderRadius: 18, marginRight: 12 }}>
              <Image source={item.image} style={{ width: W * 0.6, height: 280, borderRadius: 18 }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 14, backgroundColor: 'rgba(0,0,0,0.4)', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
                <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>{item.title}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 3 }}>{item.venue}{item.dist ? ' · ' + item.dist : ''}</Text>
                <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, alignSelf: 'flex-start', marginTop: 10 }}>
                  <Text style={{ fontSize: 13, color: '#fff', fontWeight: '600' }}>Sauvegarder</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ScrollView>
  );
}
