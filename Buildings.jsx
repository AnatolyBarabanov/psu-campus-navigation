import React, { useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from "react-native";

import { getAllBuildings } from "../utils/findRoom";
import campusData from "../data/campusData.json";

const IMAGE_BY_BUILDING_ID = {
  sutherland: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Sutherland_Building%2C_Penn_State_Abington_02.JPG",
  woodland: "https://upload.wikimedia.org/wikipedia/commons/5/59/Woodland_Building%2C_Penn_State_Abington_01.JPG",
  lares: "https://upload.wikimedia.org/wikipedia/commons/d/d5/Lares_Union_Building%2C_Penn_State_Abington_03.JPG",
  rydal: "https://upload.wikimedia.org/wikipedia/commons/e/e0/Rydal_Building%2C_Penn_State_Abington_01.JPG",
  springhouse: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Springhouse%2C_Penn_State_Abington_02.JPG",
};

function getImage(id) {
  return (
    IMAGE_BY_BUILDING_ID[id] ||
    "https://upload.wikimedia.org/wikipedia/commons/3/37/Athletic_Building%2C_Penn_State_Abington.JPG"
  );
}

function countEntrancesForBuilding(buildingId) {
  const bid = String(buildingId || "").toLowerCase();
  const waypoints = Array.isArray(campusData?.waypoints) ? campusData.waypoints : [];

  // Count waypoint entries that represent entrances for this building
  return waypoints.filter(
    (w) =>
      String(w.building || "").toLowerCase() === bid &&
      String(w.type || "").toLowerCase() === "entrance"
  ).length;
}

function countRoomsForBuilding(buildingId) {
  const bid = String(buildingId || "").toLowerCase();
  const rooms = Array.isArray(campusData?.rooms) ? campusData.rooms : [];
  return rooms.filter((r) => String(r.building || "").toLowerCase() === bid).length;
}

export default function Buildings({ navigation }) {
  const buildings = useMemo(() => getAllBuildings(), []);
  const demoBuildings = useMemo(() => buildings.slice(0, 6), [buildings]);

  return (
    <View style={s.page}>
      <Text style={s.title}>Campus Buildings</Text>
      <Text style={s.subtitle}>Tap a building to view detailed info.</Text>

      <FlatList
        data={demoBuildings}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 16 }}
        contentContainerStyle={{ gap: 16, marginTop: 20, paddingBottom: 30 }}
        renderItem={({ item }) => {
          const entranceCount = countEntrancesForBuilding(item.id);
          const roomCount = countRoomsForBuilding(item.id);

          return (
            <Pressable
              style={s.card}
              onPress={() =>
                navigation.navigate("BuildingDetail", { buildingId: item.id })
              }
            >
              <Image source={{ uri: getImage(item.id) }} style={s.image} />

              <View style={s.info}>
                <Text style={s.name} numberOfLines={1}>
                  {item.name}
                </Text>

                <Text style={s.meta}>
                  Floors: {Array.isArray(item.floors) ? item.floors.length : "N/A"}
                </Text>

                <Text style={s.meta}>Entrances: {entranceCount || "N/A"}</Text>

                <Text style={s.meta}>Rooms: {roomCount || "N/A"}</Text>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 28, fontWeight: "900", color: "#0f172a" },
  subtitle: { marginTop: 6, color: "#64748b" },

  card: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#eef2f7",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: { width: "100%", height: 120 },
  info: { padding: 12 },
  name: { fontSize: 16, fontWeight: "900", color: "#0f172a" },
  meta: { marginTop: 4, fontSize: 12, color: "#64748b" },
});