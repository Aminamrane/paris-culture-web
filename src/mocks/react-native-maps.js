import React from 'react';
import { View, Text } from 'react-native';

function MapView({ style, children }) {
  return (
    <View style={[{ backgroundColor: '#e8e8e8', justifyContent: 'center', alignItems: 'center' }, style]}>
      <Text style={{ color: '#999', fontSize: 14 }}>Carte non disponible sur web</Text>
      {children}
    </View>
  );
}

function Marker() { return null; }
function Callout() { return null; }
function Circle() { return null; }
function Polygon() { return null; }
function Polyline() { return null; }

MapView.Marker = Marker;
MapView.Callout = Callout;

export { Marker, Callout, Circle, Polygon, Polyline };
export default MapView;
