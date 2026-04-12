"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

interface MarkerData {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  category: string | null;
  coverUrl: string | null;
  count?: number;
}

interface EventMapProps {
  markers: MarkerData[];
  onMarkerClick?: (id: string) => void;
}

export default function EventMap({ markers }: EventMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "";

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [2.3522, 48.8566],
      zoom: 12,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.current.addControl(
      new mapboxgl.GeolocateControl({ trackUserLocation: true }),
      "bottom-right"
    );

    map.current.on("load", () => setLoaded(true));

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when map is loaded
  useEffect(() => {
    if (!map.current || !loaded) return;

    markers.forEach((m) => {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#E85D3A";
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";
      el.style.cursor = "pointer";

      new mapboxgl.Marker(el)
        .setLngLat([m.longitude, m.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 15 }).setText(m.title))
        .addTo(map.current!);
    });
  }, [loaded, markers]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
}
