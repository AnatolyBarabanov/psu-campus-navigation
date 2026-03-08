import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BottomMenu from "../components/BottomMenu.jsx";
import campusData from "../data/campusData.json";

function sortFloors(floors) {
  const orderValue = (f) => {
    const v = String(f).toLowerCase();
    if (v === "ground" || v === "g") return 0;
    const n = Number(v);
    return Number.isNaN(n) ? 999 : n;
  };

  return [...(floors || [])].sort((a, b) => orderValue(a) - orderValue(b));
}

export default function BuildingMapView() {
  const navigate = useNavigate();
  const { buildingId } = useParams();

  const building = useMemo(() => {
    return (campusData.buildings || []).find(
      (b) => String(b.id).toLowerCase() === String(buildingId).toLowerCase()
    );
  }, [buildingId]);

  const floors = useMemo(() => sortFloors(building?.floors || []), [building]);
  const [selectedFloor, setSelectedFloor] = useState(floors[0] || "");
  const [zoom, setZoom] = useState(1);

  if (!building) {
    return (
      <div className="page">
        <div className="panel">
          <div className="panelTitle">Building not found</div>
          <button className="primaryBtn" onClick={() => navigate("/map")}>
            Back to Map
          </button>
        </div>
        <BottomMenu />
      </div>
    );
  }

  const zoomIn = () => setZoom((z) => Math.min(z + 0.2, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.6));
  const resetZoom = () => setZoom(1);

  return (
    <div className="page">
      <div className="brandRow">
        <div className="psuBadge">PSU</div>
        <div className="brand">PENN STATE ABINGTON</div>
      </div>

      <div className="title" style={{ fontSize: "30px" }}>
        {building.name}
      </div>

      <div className="panel">
        <div className="floorViewerTopBar">
          <div className="floorSelectorWrap">
            <label className="label" style={{ marginTop: 0 }}>Floor</label>
            <select
              className="input"
              value={selectedFloor}
              onChange={(e) => setSelectedFloor(e.target.value)}
            >
              {floors.map((floor) => (
                <option key={String(floor)} value={String(floor)}>
                  {String(floor)}
                </option>
              ))}
            </select>
          </div>

          <div className="floorViewerActions">
            <button className="smallBtn" onClick={() => navigate("/map")}>
              Back to Map
            </button>
          </div>
        </div>

        <div className="resultMeta" style={{ marginTop: "10px" }}>
          Viewing floor: <b>{String(selectedFloor)}</b>
        </div>

        <div className="zoomToolbar">
          <button className="smallBtn" onClick={zoomOut}>−</button>
          <button className="smallBtn" onClick={resetZoom}>Reset</button>
          <button className="smallBtn" onClick={zoomIn}>+</button>
        </div>

        <div className="svgViewport">
          <div
            className="svgCanvas"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            <div className="svgPlaceholder">
              <div className="svgPlaceholderTitle">
                {building.name} — Floor {String(selectedFloor)}
              </div>
              <div className="svgPlaceholderText">
                SVG floor map placeholder
              </div>
              <div className="svgPlaceholderSub">
                Real SVG file will be added later.
              </div>

              {/* fake rooms just for UI preview */}
              <div className="roomBox roomA">Room A</div>
              <div className="roomBox roomB">Room B</div>
              <div className="roomBox roomC">Room C</div>
              <div className="roomBox roomD">Room D</div>
              <div className="hallwayBox">Hallway</div>
            </div>
          </div>
        </div>

        <div className="mapInfoBox" style={{ marginTop: "14px" }}>
          <div className="panelTitleSmall">Later Integration</div>
          <ul className="mapFeatureList">
            <li>Replace placeholder with real SVG floor files</li>
            <li>Highlight rooms and waypoints</li>
            <li>Overlay navigation route on the floor plan</li>
            <li>Update progress using scanned QR codes</li>
          </ul>
        </div>
      </div>

      <BottomMenu />
    </div>
  );
}