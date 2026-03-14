// src/pages/NavigationPage.jsx
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

function ArrowIcon({ direction }) {
  const map = {
    straight: "↑",
    left: "↰",
    right: "↱",
    upstairs: "⇡",
    downstairs: "⇣",
    arrived: "✓",
  };

  return <div className="navArrow">{map[direction] || "↑"}</div>;
}

function RouteOverlay({ open, onClose, destination }) {
  if (!open) return null;

  return (
    <div className="routeOverlayBackdrop">
      <div className="routeOverlayCard">
        <div className="routeOverlayTop">
          <div className="panelTitle">Route Overview</div>
          <button className="smallBtn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="routeOverlayMeta">
          {destination?.building?.name} {destination?.room?.room_number}
        </div>

        <div className="routeOverlayMap">
          <div className="routeMapPlaceholder">
            <div className="routeNode startNode">You</div>
            <div className="routeNode hallNode">Hallway</div>
            <div className="routeNode stairsNode">Stairs</div>
            <div className="routeNode endNode">Room</div>

            <div className="routeLine line1" />
            <div className="routeLine line2" />
            <div className="routeLine line3" />
          </div>
        </div>

        <div className="routeOverlayInfo">
          Floor map overlay placeholder. Later this will show the calculated
          shortest path, including stairs or elevator if the destination is on a
          different floor.
        </div>
      </div>
    </div>
  );
}

export default function NavigationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const destination = state?.destination || null;

  const videoRef = useRef(null);

  const [gpsStatus, setGpsStatus] = useState("Getting GPS...");
  const [cameraStatus, setCameraStatus] = useState("Starting camera...");
  const [userCoords, setUserCoords] = useState(null);
  const [qrStatus, setQrStatus] = useState("Waiting for QR scan...");
  const [instruction, setInstruction] = useState("Move toward the destination.");
  const [direction, setDirection] = useState("straight");
  const [routeOverlayOpen, setRouteOverlayOpen] = useState(false);

  const destinationBuilding = destination?.building || null;
  const destinationRoom = destination?.room || null;

  const distanceToBuilding = useMemo(() => {
    if (
      !userCoords ||
      destinationBuilding?.latitude == null ||
      destinationBuilding?.longitude == null
    ) {
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
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraStatus(
            "Camera unavailable. Use HTTPS or allow camera access in the browser."
          );
          return;
        }

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
    if (distanceToBuilding == null) {
      setInstruction("Checking location and preparing navigation...");
      setDirection("straight");
      return;
    }

    if (distanceToBuilding > 60) {
      setInstruction(
        `Walk toward ${destinationBuilding?.name || "the destination building"}.`
      );
      setDirection("straight");
      setQrStatus("QR scanning will begin when you enter the building.");
      return;
    }

    if (distanceToBuilding > 20) {
      setInstruction("You are close. Approach the building entrance.");
      setDirection("straight");
      setQrStatus("Once inside, show a QR code to update navigation.");
      return;
    }

    setInstruction("You are near the building. Show a QR code to start indoor navigation.");
    setDirection("straight");
    setQrStatus("Indoor QR scan ready.");
  }, [distanceToBuilding, destinationBuilding]);

  if (!destination) {
    return (
      <div className="page">
        <div className="panel">
          <div className="panelTitle">No destination selected</div>
          <div className="resultMeta">Please return to Search and choose a room.</div>
          <button className="primaryBtn" onClick={() => navigate("/")}>
            Back to Search
          </button>
        </div>
        <BottomMenu />
      </div>
    );
  }

  const destinationLabel = `${destinationBuilding?.name || destinationRoom?.building || ""} ${
    destinationRoom?.room_number || ""
  }`;

  return (
    <div className="page navPage">
      <div className="brandRow">
        <div className="psuBadge">PSU</div>
        <div className="brand">PENN STATE ABINGTON</div>
      </div>

      <div className="title" style={{ fontSize: "30px" }}>
        Navigation
      </div>

      <div className="navDestCard">
        <div className="navDestTitle">Destination</div>
        <div className="navDestMain">{destinationLabel}</div>
        <div className="navDestSub">
          {destinationRoom?.room_name || "Room"} • Floor {destinationRoom?.floor}
        </div>
      </div>

      <div className="navCameraPanel">
        <div className="cameraWrap">
          {cameraStatus.toLowerCase().includes("error") ||
          cameraStatus.toLowerCase().includes("unavailable") ? (
            <div className="cameraFallback">
              <div className="cameraFallbackTitle">Camera unavailable</div>
              <div className="cameraFallbackText">
                Use HTTPS and allow camera permission to enable live navigation.
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="cameraVideo"
            />
          )}

          <div className="cameraOverlay">
            <ArrowIcon direction={direction} />
            <div className="cameraInstruction">{instruction}</div>
          </div>
        </div>

        <div className="navStatusCard">
          <div className="navStatusLine">
            <span className="navStatusLabel">GPS</span>
            <span className="navStatusValue">{gpsStatus}</span>
          </div>

          {distanceToBuilding != null ? (
            <div className="navStatusLine">
              <span className="navStatusLabel">Distance</span>
              <span className="navStatusValue">
                {Math.round(distanceToBuilding)} meters
              </span>
            </div>
          ) : null}

          <div className="navStatusLine">
            <span className="navStatusLabel">Camera</span>
            <span className="navStatusValue">{cameraStatus}</span>
          </div>

          <div className="navStatusLine">
            <span className="navStatusLabel">QR</span>
            <span className="navStatusValue">{qrStatus}</span>
          </div>
        </div>

        <div className="navActionRow">
          <button
            className="smallBtn"
            onClick={() => setRouteOverlayOpen(true)}
          >
            View Map
          </button>

          <button className="smallBtn" onClick={() => navigate("/")}>
            End Navigation
          </button>
        </div>
      </div>

      <RouteOverlay
        open={routeOverlayOpen}
        onClose={() => setRouteOverlayOpen(false)}
        destination={destination}
      />

      <BottomMenu />
    </div>
  );
}