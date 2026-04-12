import { create } from "zustand";
import type { EventFilters, MapViewState } from "@/types";
import { PARIS_CENTER } from "@/types";

interface EventStore {
  filters: EventFilters;
  setFilters: (filters: Partial<EventFilters>) => void;
  resetFilters: () => void;

  mapView: MapViewState;
  setMapView: (view: Partial<MapViewState>) => void;

  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;

  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useEventStore = create<EventStore>((set) => ({
  filters: {},
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: {} }),

  mapView: PARIS_CENTER,
  setMapView: (view) =>
    set((state) => ({ mapView: { ...state.mapView, ...view } })),

  selectedEventId: null,
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
