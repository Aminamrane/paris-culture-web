import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

var W = Dimensions.get('window').width;

export default function EventDetailScreen({ route, navigation }) {
  var event = route.params.event;
  var insets = useSafeAreaInsets();
  var _s1 = useState(''); var newComment = _s1[0]; var setNewComment = _s1[1];
  var _s2 = useState(event.comments || []); var comments = _s2[0]; var setComments = _s2[1];
  var _s3 = useState(false); var liked = _s3[0]; var setLiked = _s3[1];

  function handleAddComment() {
    if (!newComment.trim()) return;
    var c = { id: 'n' + Date.now(), user: 'Youcef Amrane', avatar: null, text: newComment.trim(), time: "A l'instant", likes: 0 };
    setComments([c].concat(comments));
    setNewComment('');
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: '#fff' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header Image */}
      <View style={{ height: 260 }}>
        <Image source={event.image} style={{ width: W, height: 260 }} />
        <View style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity onPress={function () { navigation.goBack(); }} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="arrow-back" size={20} color="#333" />
          </TouchableOpacity>
          <TouchableOpacity style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.9)', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="share-outline" size={18} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={{ position: 'absolute', bottom: 16, left: 16, backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>{event.category}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 26, fontWeight: '800', color: '#1a1a1a' }}>{event.title}</Text>
          <Text style={{ fontSize: 15, color: '#666', marginTop: 4 }}>{event.subtitle}</Text>

          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
              <Ionicons name="calendar-outline" size={15} color="#666" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: '#444', flex: 1 }}>{event.date}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={15} color="#666" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: '#444', flex: 1 }}>{event.time}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 12 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
              <Ionicons name="location-outline" size={15} color="#666" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: '#444', flex: 1 }} numberOfLines={2}>{event.address}</Text>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pricetag-outline" size={15} color="#666" style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, color: '#444' }}>{event.price}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', marginRight: 10 }}>
              {[0, 1, 2, 3].map(function (idx) {
                return (
                  <View key={idx} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff', marginLeft: idx === 0 ? 0 : -8, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="person" size={14} color="#999" />
                  </View>
                );
              })}
            </View>
            <Text style={{ fontSize: 13, color: '#666' }}>{event.attendees} personnes interessees</Text>
          </View>

          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginTop: 20, marginBottom: 10 }}>A propos</Text>
          <Text style={{ fontSize: 14, color: '#555', lineHeight: 22 }}>{event.description}</Text>

          <View style={{ flexDirection: 'row', marginTop: 20 }}>
            <TouchableOpacity onPress={function () { setLiked(!liked); }} style={{ flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', marginRight: 6 }}>
              <Ionicons name={liked ? 'heart' : 'heart-outline'} size={18} color={liked ? '#2563EB' : '#555'} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: liked ? '#2563EB' : '#555' }}>{liked ? 'Aime' : "J'aime"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#2563EB', alignItems: 'center', marginLeft: 6 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Participer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Comments */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 12 }}>Commentaires ({comments.length})</Text>
          {comments.map(function (c) {
            return (
              <View key={c.id} style={{ flexDirection: 'row', marginBottom: 16 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="person" size={18} color="#999" />
                </View>
                <View style={{ flex: 1, backgroundColor: '#f8f8f8', borderRadius: 14, padding: 12, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#1a1a1a' }}>{c.user}</Text>
                    <Text style={{ fontSize: 11, color: '#999' }}>{c.time}</Text>
                  </View>
                  <Text style={{ fontSize: 13, color: '#444', lineHeight: 19 }}>{c.text}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Ionicons name="heart-outline" size={12} color="#999" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 12, color: '#999' }}>{c.likes}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 10, paddingBottom: insets.bottom + 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff' }}>
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="person" size={16} color="#999" />
        </View>
        <TextInput
          style={{ flex: 1, height: 38, backgroundColor: '#f5f5f5', borderRadius: 19, paddingHorizontal: 14, fontSize: 14, color: '#333', marginLeft: 10 }}
          placeholder="Ajouter un commentaire..."
          placeholderTextColor="#999"
          value={newComment}
          onChangeText={setNewComment}
          onSubmitEditing={handleAddComment}
        />
        <TouchableOpacity onPress={handleAddComment} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: newComment.trim() ? '#2563EB' : '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginLeft: 8 }}>
          <Ionicons name="send" size={16} color={newComment.trim() ? '#fff' : '#999'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
