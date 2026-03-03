// src/pages/SearchPage.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";

import campusData from "../data/campusData.json";

function byName(a, b) {
  return String(a?.name || "").localeCompare(String(b?.name || ""));
}

export default function SearchPage() {
  // Buildings: campusData.buildings[]
  const buildings = useMemo(() => {
    const arr = Array.isArray(campusData?.buildings)
      ? [...campusData.buildings]
      : [];
    arr.sort(byName);
    return arr;
  }, []);

  // Rooms: campusData.rooms[]
  const rooms = useMemo(() => {
    return Array.isArray(campusData?.rooms) ? campusData.rooms : [];
  }, []);

  const [selectedBuildingId, setSelectedBuildingId] = useState(
    buildings[0]?.id || ""
  );
  const [roomNumber, setRoomNumber] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  );

  function findMatches() {
    setStatus("");
    setResults([]);

    if (!selectedBuildingId) {
      setStatus("Please select a building.");
      return;
    }

    const r = String(roomNumber || "").trim();
    if (!r) {
      setStatus("Please enter a room number.");
      return;
    }

    const matches = rooms.filter(
      (x) =>
        String(x.building).toLowerCase() ===
          String(selectedBuildingId).toLowerCase() &&
        String(x.room_number).toLowerCase() === r.toLowerCase()
    );

    if (matches.length === 0) {
      setStatus(
        `No results for room ${r} in ${selectedBuilding?.name || selectedBuildingId}.`
      );
      return;
    }

    setResults(matches);
  }

  // RN-friendly “dropdown”: Prev/Next building selector
  const buildingIndex = Math.max(
    0,
    buildings.findIndex((b) => b.id === selectedBuildingId)
  );

  const prevBuilding = () => {
    if (buildingIndex <= 0) return;
    setSelectedBuildingId(buildings[buildingIndex - 1].id);
  };

  const nextBuilding = () => {
    if (buildingIndex >= buildings.length - 1) return;
    setSelectedBuildingId(buildings[buildingIndex + 1].id);
  };

  // Placeholder buttons (no navigation yet)
  const placeholder = (name) =>
    Alert.alert("Coming Soon", `${name} screen will be implemented later.`);

  return (
    <View style={s.page}>
      <Text style={s.brand}>CAMPUS NAVIGATION</Text>
      <Text style={s.title}>Where are you{"\n"}heading today?</Text>

      {/* SEARCH SECTION */}
      <View style={s.panel}>
        <Text style={s.panelTitle}>Search Classroom</Text>

        <Text style={s.label}>Building</Text>
        <View style={s.dropdownRow}>
          <Pressable
            onPress={prevBuilding}
            style={[s.smallBtn, buildingIndex === 0 && s.disabled]}
            disabled={buildingIndex === 0}
          >
            <Text style={s.smallBtnText}>Prev</Text>
          </Pressable>

          <View style={s.dropdownBox}>
            <Text style={s.dropdownText}>
              {selectedBuilding ? `${selectedBuilding.name}` : "No buildings"}
            </Text>
          </View>

          <Pressable
            onPress={nextBuilding}
            style={[
              s.smallBtn,
              buildingIndex >= buildings.length - 1 && s.disabled,
            ]}
            disabled={buildingIndex >= buildings.length - 1}
          >
            <Text style={s.smallBtnText}>Next</Text>
          </Pressable>
        </View>

        <Text style={s.label}>Room number</Text>
        <TextInput
          style={s.input}
          value={roomNumber}
          onChangeText={setRoomNumber}
          placeholder="e.g. 218, 132B, G04"
          placeholderTextColor="#94a3b8"
          autoCapitalize="characters"
        />

        <Pressable style={s.searchBtn} onPress={findMatches}>
          <Text style={s.searchBtnText}>Search</Text>
        </Pressable>

        {status ? <Text style={s.status}>{status}</Text> : null}

        {/* RESULTS + Navigate per result */}
        {results.length > 0 && (
          <View style={{ marginTop: 12 }}>
            <Text style={s.resultsTitle}>Results</Text>
            <FlatList
              data={results}
              keyExtractor={(item, idx) =>
                `${item.building}-${item.room_number}-${idx}`
              }
              renderItem={({ item }) => (
                <View style={s.resultCard}>
                  <Text style={s.resultRoom}>{item.room_number}</Text>
                  <Text style={s.resultMeta}>
                    {item.room_name || "Room"} • Floor {item.floor} • Type:{" "}
                    {item.type}
                  </Text>
                  <Text style={s.resultMeta2}>
                    Waypoint: {item.waypoint_id}
                    {item.capacity ? ` • Capacity: ${item.capacity}` : ""}
                  </Text>

                  <Pressable
                    style={s.navigateBtn}
                    onPress={() =>
                      Alert.alert(
                        "Navigate (Placeholder)",
                        `Will navigate to ${selectedBuildingId} ${item.room_number}\nWaypoint: ${item.waypoint_id}`
                      )
                    }
                  >
                    <Text style={s.navigateBtnText}>Navigate</Text>
                  </Pressable>
                </View>
              )}
            />
          </View>
        )}
      </View>

      {/* BUTTONS SECTION (Navigate removed, Scan QR removed) */}
      <View style={s.grid}>
        <ActionCard
          title="Map View"
          subtitle="Campus overview"
          onPress={() => placeholder("Map View")}
        />
        <ActionCard
          title="Buildings"
          subtitle="Explore campus"
          onPress={() => placeholder("Buildings")}
        />
      </View>
    </View>
  );
}

function ActionCard({ title, subtitle, onPress }) {
  return (
    <Pressable style={s.card} onPress={onPress}>
      <View style={s.iconStub} />
      <Text style={s.cardTitle}>{title}</Text>
      <Text style={s.cardSub}>{subtitle}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  brand: { color: "#2b6cb0", fontWeight: "800", letterSpacing: 2, fontSize: 12 },
  title: { marginTop: 10, fontSize: 40, fontWeight: "900", color: "#0f172a" },

  panel: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 18,
    padding: 16,
  },
  panelTitle: { fontSize: 18, fontWeight: "900", color: "#0f172a" },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "800", color: "#334155" },

  dropdownRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  smallBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  smallBtnText: { fontWeight: "900", color: "#0f172a" },
  disabled: { opacity: 0.35 },

  dropdownBox: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  dropdownText: { fontWeight: "800", color: "#0f172a" },

  input: {
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    color: "#0f172a",
  },

  searchBtn: {
    marginTop: 12,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  searchBtnText: { color: "#fff", fontWeight: "900" },

  status: { marginTop: 10, color: "#0f172a" },

  resultsTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "900",
    color: "#0f172a",
  },
  resultCard: {
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 14,
    padding: 12,
    marginTop: 10,
  },
  resultRoom: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  resultMeta: { marginTop: 4, color: "#64748b" },
  resultMeta2: { marginTop: 2, color: "#94a3b8" },

  navigateBtn: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  navigateBtnText: { color: "#fff", fontWeight: "900" },

  grid: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 30,
  },
  card: {
    width: "47%",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eef2f7",
    padding: 18,
    backgroundColor: "#fff",
  },
  iconStub: { width: 52, height: 52, borderRadius: 16, backgroundColor: "#eef2ff" },
  cardTitle: { marginTop: 16, fontSize: 18, fontWeight: "900", color: "#0f172a" },
  cardSub: { marginTop: 6, color: "#94a3b8" },
});