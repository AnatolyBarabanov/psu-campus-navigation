// src/pages/BuildingDetail.jsx
import React, { useMemo } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import campusData from "../data/campusData.json";

const BUILDING_DESCRIPTIONS = {
  sutherland:
    "A historic building designed by Julian Abele, featuring classrooms, academic advising, a tutoring center, and a lecture hall in a converted indoor swimming pool.",
  lares:
    "Houses the cafeteria, bookstore, and Student Affairs.",
  lionsgate:
    "Opened in 2017, this is the main residential facility, offering 400 beds in apartment-style units.",
  woodland:
    "A central campus building with offices and academic space.",
  springhouse:
    "Contains classrooms and the Collegiate Recovery Program.",
  rydal:
    "Used for classrooms and campus security.",
  athletic:
    "Features facilities for campus recreation and teams.",
};

export default function BuildingDetail({ route }) {
  const { buildingId } = route.params || {};

  const building = useMemo(() => {
    const all = Array.isArray(campusData?.buildings) ? campusData.buildings : [];
    return (
      all.find(
        (b) =>
          String(b.id).toLowerCase() === String(buildingId || "").toLowerCase()
      ) || null
    );
  }, [buildingId]);

  const description =
    BUILDING_DESCRIPTIONS[String(buildingId || "").toLowerCase()] ||
    "Information coming soon.";

  if (!building) {
    return (
      <View style={s.page}>
        <Text style={s.title}>Building not found</Text>
        <Text style={s.sub}>No data for: {String(buildingId)}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={s.title}>{building.name}</Text>
      <Text style={s.sub}>ID: {building.id}</Text>

      <View style={s.section}>
        <Text style={s.sectionTitle}>About This Building</Text>
        <Text style={s.row}>{description}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Location</Text>
        <Text style={s.row}>Latitude: {building.latitude ?? "N/A"}</Text>
        <Text style={s.row}>Longitude: {building.longitude ?? "N/A"}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Floors</Text>
        {Array.isArray(building.floors) && building.floors.length > 0 ? (
          building.floors.map((f) => (
            <Text key={String(f)} style={s.bullet}>
              • {String(f)}
            </Text>
          ))
        ) : (
          <Text style={s.row}>N/A</Text>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Entrances (Waypoints)</Text>
        {Array.isArray(building.entrances) && building.entrances.length > 0 ? (
          building.entrances.map((e) => (
            <Text key={String(e)} style={s.bullet}>
              • {String(e)}
            </Text>
          ))
        ) : (
          <Text style={s.row}>N/A</Text>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Placeholder</Text>
        <Text style={s.row}>
          Floor selection + SVG floor maps will be added later.
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "900", color: "#0f172a" },
  sub: { marginTop: 6, color: "#64748b" },

  section: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
  },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  row: { marginTop: 8, color: "#334155", lineHeight: 20 },
  bullet: { marginTop: 8, color: "#334155" },
});