// src/pages/SearchPage.jsx
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  Image,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { findRoom, getAllBuildings } from "../utils/findRoom";

const PSU = {
  blue: "#001E44",     // Penn State blue vibe
  blue2: "#0B3D91",    // accent blue
  light: "#F5F7FA",
  border: "#E6ECF2",
  text: "#0B1220",
  muted: "#5B6776",
  white: "#FFFFFF",
};

export default function SearchPage({ navigation }) {
  const buildings = useMemo(() => getAllBuildings(), []);
  const [selectedBuildingId, setSelectedBuildingId] = useState(
    buildings[0]?.id || ""
  );
  const [roomNumber, setRoomNumber] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("");

  // Dropdown modal state (iOS-friendly)
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [pendingBuildingId, setPendingBuildingId] = useState(
    buildings[0]?.id || ""
  );

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) || null,
    [buildings, selectedBuildingId]
  );

  const openBuildingPicker = () => {
    setPendingBuildingId(selectedBuildingId || buildings[0]?.id || "");
    setBuildingModalOpen(true);
  };

  const confirmBuildingPicker = () => {
    setSelectedBuildingId(pendingBuildingId);
    setBuildingModalOpen(false);
  };

  const search = () => {
    setStatus("");
    setResult(null);

    if (!selectedBuildingId) {
      setStatus("Please select a building.");
      return;
    }

    const r = String(roomNumber || "").trim();
    if (!r) {
      setStatus("Please enter a room number.");
      return;
    }

    const found = findRoom(selectedBuildingId, r);

    if (!found) {
      setStatus(
        `No results for room ${r} in ${selectedBuilding?.name || selectedBuildingId}.`
      );
      return;
    }

    setResult(found);
  };

  const placeholder = (name) =>
    Alert.alert("Coming Soon", `${name} screen will be implemented later.`);

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.brand}>PENN STATE ABINGTON</Text>
          <Text style={s.title}>Where are you{"\n"}heading today?</Text>
        </View>

        {/* Main panel */}
        <View style={s.panel}>
          <Text style={s.panelTitle}>Search Classroom</Text>

          <Text style={s.label}>Building</Text>
          <Pressable style={s.dropdownField} onPress={openBuildingPicker}>
            <Text style={s.dropdownValue}>
              {selectedBuilding?.name || "Select building"}
            </Text>
            <Text style={s.dropdownChevron}>▾</Text>
          </Pressable>

          <Modal
            visible={buildingModalOpen}
            transparent
            animationType="slide"
            onRequestClose={() => setBuildingModalOpen(false)}
          >
            <View style={s.modalBackdrop}>
              <View style={s.modalSheet}>
                <View style={s.modalHeader}>
                  <Pressable onPress={() => setBuildingModalOpen(false)}>
                    <Text style={s.modalCancel}>Cancel</Text>
                  </Pressable>

                  <Text style={s.modalTitle}>Select Building</Text>

                  <Pressable onPress={confirmBuildingPicker}>
                    <Text style={s.modalDone}>Done</Text>
                  </Pressable>
                </View>

                <Picker
                  selectedValue={pendingBuildingId}
                  onValueChange={(val) => setPendingBuildingId(val)}
                  style={s.pickerIOS}
                  itemStyle={s.pickerItemIOS}
                >
                  {buildings.map((b) => (
                    <Picker.Item
                      key={b.id}
                      label={b.name}
                      value={b.id}
                      color={PSU.text}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </Modal>

          <Text style={s.label}>Room number</Text>
          <TextInput
            style={s.input}
            value={roomNumber}
            onChangeText={setRoomNumber}
            placeholder="e.g. 218, 132B, G04"
            placeholderTextColor="#8B97A7"
            autoCapitalize="characters"
          />

          <Pressable style={s.searchBtn} onPress={search}>
            <Text style={s.searchBtnText}>Search</Text>
          </Pressable>

          {status ? <Text style={s.status}>{status}</Text> : null}

          {result && <ResultCard result={result} />}
        </View>

        {/* Bottom menu */}
        <View style={s.bottomMenu}>
          <BottomItem
            label="Map"
            onPress={() => placeholder("Map View")}
            icon={<Text style={s.menuIcon}>🗺️</Text>}
          />

          <View style={s.logoWrap}>
            <Image
              source={require("../assets/psu-logo.png")}
              style={s.logo}
              resizeMode="contain"
            />
          </View>

          <BottomItem
            label="Buildings"
            onPress={() => navigation.navigate("Buildings")}
            icon={<Text style={s.menuIcon}>🏛️</Text>}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ResultCard({ result }) {
  const { room, building } = result;

  return (
    <View style={s.resultCard}>
      <View style={s.resultHeaderRow}>
        <View style={{ flex: 1 }}>
          <Text style={s.resultRoom}>
            {(building?.name || room.building) + " " + room.room_number}
          </Text>

          <Text style={s.resultMeta}>
            {room.room_name || "Room"} • Floor {room.floor} • {room.type}
          </Text>

          {room.capacity ? (
            <Text style={s.resultMeta2}>Capacity: {room.capacity}</Text>
          ) : null}
        </View>

        <Pressable
          style={s.goBtn}
          onPress={() =>
            Alert.alert(
              "Navigate (Placeholder)",
              `Will navigate to ${(building?.name || room.building)} ${room.room_number}`
            )
          }
        >
          <Text style={s.goBtnText}>Go</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BottomItem({ icon, label, onPress }) {
  return (
    <Pressable style={s.bottomItem} onPress={onPress}>
      {icon}
      <Text style={s.bottomLabel}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PSU.light },
  page: { flex: 1, backgroundColor: PSU.light },

  header: { paddingTop: 18, paddingHorizontal: 20 },
  brand: {
    color: PSU.blue,
    fontWeight: "900",
    letterSpacing: 1.5,
    fontSize: 12,
  },
  title: {
    marginTop: 10,
    fontSize: 38,
    fontWeight: "900",
    color: PSU.text,
  },

  panel: {
    marginTop: 18,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: PSU.border,
    borderRadius: 18,
    padding: 16,
    backgroundColor: PSU.white,
  },
  panelTitle: { fontSize: 18, fontWeight: "900", color: PSU.text },
  label: { marginTop: 12, marginBottom: 6, fontWeight: "800", color: PSU.muted },

  dropdownField: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PSU.border,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: PSU.white,
  },
  dropdownValue: { color: PSU.text, fontWeight: "800" },
  dropdownChevron: { color: "#8B97A7", fontSize: 18, marginLeft: 10 },

  input: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PSU.border,
    paddingHorizontal: 12,
    color: PSU.text,
    backgroundColor: PSU.white,
  },

  searchBtn: {
    marginTop: 12,
    backgroundColor: PSU.blue,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  searchBtnText: { color: PSU.white, fontWeight: "900" },

  status: { marginTop: 10, color: PSU.text },

  resultCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: PSU.border,
    borderRadius: 14,
    padding: 12,
    backgroundColor: PSU.light,
  },

  resultHeaderRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  resultRoom: { fontSize: 16, fontWeight: "900", color: PSU.text },
  resultMeta: { marginTop: 4, color: PSU.muted },
  resultMeta2: { marginTop: 6, color: "#6B7A8C" },

  goBtn: {
    width: 52,
    height: 38,
    borderRadius: 10,
    backgroundColor: PSU.blue2,
    alignItems: "center",
    justifyContent: "center",
  },
  goBtnText: { color: PSU.white, fontWeight: "900" },

  // Bottom menu
  bottomMenu: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: PSU.border,
    backgroundColor: PSU.white,
  },
  bottomItem: { width: 90, alignItems: "center", justifyContent: "center" },
  menuIcon: { fontSize: 22 },
  bottomLabel: { marginTop: 4, fontSize: 12, fontWeight: "800", color: PSU.muted },

  logoWrap: {
    width: 90,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: { width: 70, height: 44 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: PSU.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 12 },
  modalHeader: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: PSU.border,
  },
  modalTitle: { fontWeight: "900", color: PSU.text },
  modalCancel: { color: PSU.muted, fontWeight: "800" },
  modalDone: { color: PSU.blue2, fontWeight: "900" },

  pickerIOS: { backgroundColor: PSU.white },
  pickerItemIOS: {
    color: PSU.text,
    fontSize: 18,
    height: Platform.OS === "ios" ? 200 : undefined,
  },
});
