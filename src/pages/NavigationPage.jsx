import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BottomMenu from "../components/BottomMenu.jsx";

function haversineDistance(lat1, lon1, lat2, lon2) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(a));
}

export default function NavigationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const destination = state?.destination || null;

  const videoRef = useRef(null);

  const [gpsStatus, setGpsStatus] = useState("Getting GPS...");
  const [cameraStatus, setCameraStatus] = useState("Starting camera...");
  const [userCoords, setUserCoords] = useState(null);
  const [qrStatus, setQrStatus] = useState("QR scanning will be added next.");
  const [instruction, setInstruction] = useState("Move toward the destination.");

  const destinationBuilding = destination?.building || null;
  const destinationRoom = destination?.room || null;

  const distanceToBuilding = useMemo(() => {
    if (!userCoords || !destinationBuilding?.latitude || !destinationBuilding?.longitude) {
      return null;
    }

    return haversineDistance(
      userCoords.latitude,
      userCoords.longitude,
      destinationBuilding.latitude,
      destinationBuilding.longitude
    );
  }, [userCoords, destinationBuilding]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setGpsStatus("GPS location acquired.");
      },
      (err) => {
        setGpsStatus(`GPS error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCameraStatus("Camera active.");
      } catch (err) {
        setCameraStatus(`Camera error: ${err.message}`);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (distanceToBuilding == null) return;

    if (distanceToBuilding > 40) {
      setInstruction("You are outside the building. Walk toward the destination building.");
    } else {
      setInstruction("You are near the building. Scan a QR code to begin indoor navigation.");
    }
  }, [distanceToBuilding]);

  if (!destination) {
    return (
      <div className="page">
        <div className="panel">
          <div className="panelTitle">No destination selected</div>
          <button className="primaryBtn" onClick={() => navigate("/")}>
            Back to Search
          </button>
        </div>
        <BottomMenu />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="brandRow">
        <div className="psuBadge">PSU</div>
        <div className="brand">PENN STATE ABINGTON</div>
      </div>

      <div className="title" style={{ fontSize: "30px" }}>
        Navigation
      </div>

      <div className="panel">
        <div className="panelTitle">
          Destination: {destinationBuilding?.name} {destinationRoom?.room_number}
        </div>

        <div className="resultMeta">
          {destinationRoom?.room_name || "Room"} • Floor {destinationRoom?.floor}
        </div>

        <div style={{ marginTop: "14px" }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              minHeight: "260px",
              borderRadius: "16px",
              background: "#000",
              objectFit: "cover",
            }}
          />
        </div>

        <div style={{ marginTop: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "60px", color: "var(--psu-blue)" }}>↑</div>
          <div className="resultMeta">{instruction}</div>
        </div>

        <div style={{ marginTop: "14px" }} className="resultMeta">
          {gpsStatus}
        </div>

        {distanceToBuilding != null ? (
          <div className="resultMeta2">
            Distance to building: {Math.round(distanceToBuilding)} meters
          </div>
        ) : null}

        <div className="resultMeta2">{cameraStatus}</div>
        <div className="resultMeta2">{qrStatus}</div>

        <button className="primaryBtn" onClick={() => navigate("/")}>
          End Navigation
        </button>
      </div>

      <BottomMenu />
    </div>
  );
}