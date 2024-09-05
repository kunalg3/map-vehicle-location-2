import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/cotton/64/car--v3.png', // Example vehicle icon
  iconSize: [32, 32],
});

// Coordinates for the vehicle route
const pathCoordinates = [
  [28.7041, 77.1025], // Example: Delhi
  [28.5355, 77.3910], // Noida
  [28.4595, 77.0266], // Gurgaon
  // Add more coordinates to simulate the vehicle movement
];

const MapComponent = () => {
  const [vehiclePosition, setVehiclePosition] = useState(pathCoordinates[0]);
  const [index, setIndex] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isMoving) {
      intervalRef.current = setInterval(() => {
        setIndex((prevIndex) => (prevIndex + 1) % pathCoordinates.length);
        setVehiclePosition(pathCoordinates[index]);
      }, 1000); // Update every 1 second
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isMoving, index]);

  // Handler for button click to start the vehicle movement
  const handleStartMovement = () => {
    if (!isMoving) {
      setIsMoving(true);
    }
  };

  return (
    <div>
      <MapContainer center={vehiclePosition} zoom={10} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={vehiclePosition} icon={vehicleIcon} />
        <Polyline positions={pathCoordinates} color="blue" />
      </MapContainer>

      <button onClick={handleStartMovement} style={{ marginTop: '20px' }}>
        Start Vehicle Movement
      </button>
    </div>
  );
};

export default MapComponent;
