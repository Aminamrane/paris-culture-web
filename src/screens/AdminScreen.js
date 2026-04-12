import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Switch, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { EVENTS } from '../data/events';
import { CATEGORIES } from '../data/categories';
import { useAdmin } from '../context/AdminContext';

var W = Dimensions.get('window').width;
var AMBER = '#F5A623';
var BG = '#0d1117';
var CARD = '#161b22';
var BORDER = '#30363d';
var TEXT = '#e6edf3';
var SUBTEXT = '#8b949e';

// ─── PENDING EVENTS ───
var PENDING_EVENTS = [
  {
    id: 'p1',
    title: 'Vernissage — Collectif Nouveau',
    subtitle: 'Galerie du 11e',
    category: 'expo',
    date: '25 Avr 2026',
    address: '45 Rue Oberkampf, Paris 11e',
    description: "Exposition collective de jeunes artistes emergents du 11e. Peintures, sculptures et installations. Vernissage le 25 avril, ouvert au public du 26 avril au 5 mai.",
    submittedBy: 'Marie D.',
    submittedAt: 'Il y a 2h',
  },
  {
    id: 'p2',
    title: 'Concert Jazz — Trio Laurent',
    subtitle: 'Cave du Caveau',
    category: 'musique',
    date: '30 Avr 2026',
    address: '22 Rue de la Huchette, Paris 5e',
    description: "Le Trio Laurent investit le Caveau de la Huchette pour une soiree jazz manouche. Manouche, swing et bop dans la cave mythique du quartier Latin.",
    submittedBy: 'Laurent B.',
    submittedAt: 'Il y a 5h',
  },
  {
    id: 'p3',
    title: 'Atelier Street Art Gratuit',
    subtitle: 'Mur du 104',
    category: 'street',
    date: '3 Mai 2026',
    address: '5 Rue Curial, Paris 19e',
    description: "Atelier de street art ouvert a tous, anime par le collectif Spray Paris. Materiaux fournis. Venez creer votre propre pochoir sur le mur du 104.",
    submittedBy: 'Karim S.',
    submittedAt: 'Hier',
  },
];

function PendingCard({ item, onApprove, onReject }) {
  var cat = CATEGORIES[item.category];
  var _s = useState(false); var expanded = _s[0]; var setExpanded = _s[1];

  return (
    <View style={{ backgroundColor: CARD, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' }}>
      <TouchableOpacity onPress={function () { setExpanded(!expanded); }} activeOpacity={0.8} style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
          <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: cat.color + '25', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name={cat.icon} size={18} color={cat.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: TEXT }}>{item.title}</Text>
            <Text style={{ fontSize: 12, color: SUBTEXT, marginTop: 2 }}>{item.subtitle}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
              <View style={{ backgroundColor: cat.color + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: cat.color }}>{cat.label}</Text>
              </View>
              <Ionicons name="calendar-outline" size={11} color={SUBTEXT} style={{ marginRight: 3 }} />
              <Text style={{ fontSize: 11, color: SUBTEXT }}>{item.date}</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={SUBTEXT} />
            <Text style={{ fontSize: 10, color: SUBTEXT, marginTop: 6 }}>{item.submittedAt}</Text>
          </View>
        </View>

        {expanded ? (
          <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: BORDER, paddingTop: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
              <Ionicons name="location-outline" size={12} color={SUBTEXT} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: SUBTEXT }}>{item.address}</Text>
            </View>
            <Text style={{ fontSize: 13, color: '#b0b8c4', lineHeight: 20 }}>{item.description}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Ionicons name="person-circle-outline" size={14} color={SUBTEXT} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 12, color: SUBTEXT }}>Soumis par <Text style={{ color: TEXT, fontWeight: '600' }}>{item.submittedBy}</Text></Text>
            </View>
          </View>
        ) : null}
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER }}>
        <TouchableOpacity
          onPress={function () { onReject(item.id); }}
          style={{ flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', borderRightWidth: 1, borderRightColor: BORDER }}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#FF4444" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FF4444' }}>Refuser</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={function () { onApprove(item.id); }}
          style={{ flex: 1, paddingVertical: 14, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark" size={16} color="#4ADE80" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#4ADE80' }}>Approuver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EventCard({ event }) {
  var { config, toggleMap, toggleList } = useAdmin();
  var cfg = config[event.id] || { mapVisible: false, lists: [] };
  var cat = CATEGORIES[event.category];

  return (
    <View style={{ backgroundColor: CARD, borderRadius: 16, marginBottom: 14, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
        <Image source={event.image} style={{ width: 56, height: 56, borderRadius: 12 }} resizeMode="cover" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: TEXT }} numberOfLines={1}>{event.title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={{ backgroundColor: cat.color + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginRight: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: cat.color }}>{cat.label}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 11, color: SUBTEXT, marginTop: 3 }}>{event.date}</Text>
        </View>
      </View>

      <View style={{ borderTopWidth: 1, borderTopColor: BORDER }}>
        <ToggleRow
          icon="map-outline"
          label="Visible sur la carte"
          value={cfg.mapVisible}
          onToggle={function () { toggleMap(event.id); }}
          accent={AMBER}
        />
        <View style={{ height: 1, backgroundColor: BORDER, marginHorizontal: 14 }} />
        <ToggleRow
          icon="navigate-circle-outline"
          label="Autour de toi"
          value={cfg.lists.indexOf('autour') >= 0}
          onToggle={function () { toggleList(event.id, 'autour'); }}
          accent="#3B82F6"
        />
        <View style={{ height: 1, backgroundColor: BORDER, marginHorizontal: 14 }} />
        <ToggleRow
          icon="trending-up-outline"
          label="Tendances"
          value={cfg.lists.indexOf('tendances') >= 0}
          onToggle={function () { toggleList(event.id, 'tendances'); }}
          accent="#A855F7"
        />
      </View>
    </View>
  );
}

function ToggleRow({ icon, label, value, onToggle, accent }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12 }}>
      <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: value ? accent + '20' : '#ffffff10', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
        <Ionicons name={icon} size={16} color={value ? accent : SUBTEXT} />
      </View>
      <Text style={{ flex: 1, fontSize: 13, color: value ? TEXT : SUBTEXT, fontWeight: value ? '600' : '400' }}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#30363d', true: accent + '80' }}
        thumbColor={value ? accent : '#8b949e'}
        ios_backgroundColor="#30363d"
      />
    </View>
  );
}

export default function AdminScreen({ navigation }) {
  var insets = useSafeAreaInsets();
  var { config } = useAdmin();
  var _s1 = useState('events'); var tab = _s1[0]; var setTab = _s1[1];
  var _s2 = useState(PENDING_EVENTS); var pending = _s2[0]; var setPending = _s2[1];
  var _s3 = useState([]); var approved = _s3[0]; var setApproved = _s3[1];

  var mapCount = EVENTS.filter(function (e) { return config[e.id] && config[e.id].mapVisible; }).length;
  var autourCount = EVENTS.filter(function (e) { return config[e.id] && config[e.id].lists.indexOf('autour') >= 0; }).length;
  var tendancesCount = EVENTS.filter(function (e) { return config[e.id] && config[e.id].lists.indexOf('tendances') >= 0; }).length;

  function handleApprove(id) {
    var item = pending.find(function (p) { return p.id === id; });
    if (item) {
      setApproved(function (prev) { return prev.concat([item]); });
      setPending(function (prev) { return prev.filter(function (p) { return p.id !== id; }); });
    }
  }

  function handleReject(id) {
    setPending(function (prev) { return prev.filter(function (p) { return p.id !== id; }); });
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* Header */}
      <View style={{ paddingTop: insets.top + 8, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: BORDER }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={function () { navigation.goBack(); }} style={{ marginRight: 16 }}>
            <Ionicons name="arrow-back" size={22} color={TEXT} />
          </TouchableOpacity>
          <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: AMBER + '20', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
            <Ionicons name="shield-checkmark" size={20} color={AMBER} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '800', color: TEXT }}>Panneau Admin</Text>
            <Text style={{ fontSize: 11, color: SUBTEXT, marginTop: 1 }}>Lumina — Gestion du contenu</Text>
          </View>
          <View style={{ backgroundColor: '#4ADE8030', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#4ADE80' }}>LIVE</Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          {[
            { label: 'Sur la carte', value: mapCount, icon: 'map-outline', color: AMBER },
            { label: 'Autour de toi', value: autourCount, icon: 'navigate-circle-outline', color: '#3B82F6' },
            { label: 'Tendances', value: tendancesCount, icon: 'trending-up-outline', color: '#A855F7' },
            { label: 'En attente', value: pending.length, icon: 'time-outline', color: '#FF4444' },
          ].map(function (s, i) {
            return (
              <View key={i} style={{ flex: 1, alignItems: 'center', backgroundColor: s.color + '12', borderRadius: 10, paddingVertical: 10, marginRight: i < 3 ? 8 : 0 }}>
                <Ionicons name={s.icon} size={16} color={s.color} />
                <Text style={{ fontSize: 18, fontWeight: '800', color: s.color, marginTop: 4 }}>{s.value}</Text>
                <Text style={{ fontSize: 9, color: SUBTEXT, textAlign: 'center', marginTop: 1 }}>{s.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: BORDER, paddingHorizontal: 20 }}>
        {[
          { key: 'events', label: 'Evenements', icon: 'calendar-outline' },
          { key: 'pending', label: 'En attente', icon: 'time-outline', badge: pending.length },
        ].map(function (t) {
          var active = tab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              onPress={function () { setTab(t.key); }}
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderBottomWidth: active ? 2 : 0, borderBottomColor: AMBER }}
              activeOpacity={0.7}
            >
              <Ionicons name={t.icon} size={15} color={active ? AMBER : SUBTEXT} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: active ? AMBER : SUBTEXT }}>{t.label}</Text>
              {t.badge ? (
                <View style={{ marginLeft: 6, backgroundColor: '#FF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{t.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        {tab === 'events' ? (
          <>
            <Text style={{ fontSize: 12, fontWeight: '600', color: SUBTEXT, letterSpacing: 1, marginBottom: 16 }}>GESTION DES EVENEMENTS</Text>
            {EVENTS.map(function (ev) {
              return <EventCard key={ev.id} event={ev} />;
            })}
          </>
        ) : (
          <>
            <Text style={{ fontSize: 12, fontWeight: '600', color: SUBTEXT, letterSpacing: 1, marginBottom: 16 }}>
              PROPOSITIONS UTILISATEURS — {pending.length} EN ATTENTE
            </Text>
            {pending.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: 50 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: '#4ADE8015', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                  <Ionicons name="checkmark-circle" size={36} color="#4ADE80" />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '700', color: TEXT }}>Tout est traite !</Text>
                <Text style={{ fontSize: 13, color: SUBTEXT, marginTop: 6 }}>Aucune proposition en attente</Text>
              </View>
            ) : null}
            {pending.map(function (item) {
              return (
                <PendingCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              );
            })}
            {approved.length > 0 ? (
              <>
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#4ADE80', letterSpacing: 1, marginBottom: 12, marginTop: 8 }}>APPROUVES — {approved.length}</Text>
                {approved.map(function (item) {
                  var cat = CATEGORIES[item.category];
                  return (
                    <View key={item.id} style={{ backgroundColor: '#4ADE8010', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#4ADE8030', flexDirection: 'row', alignItems: 'center' }}>
                      <View style={{ width: 36, height: 36, borderRadius: 9, backgroundColor: cat.color + '25', justifyContent: 'center', alignItems: 'center', marginRight: 12 }}>
                        <Ionicons name={cat.icon} size={16} color={cat.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: TEXT }}>{item.title}</Text>
                        <Text style={{ fontSize: 11, color: SUBTEXT }}>{item.date}</Text>
                      </View>
                      <Ionicons name="checkmark-circle" size={20} color="#4ADE80" />
                    </View>
                  );
                })}
              </>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
