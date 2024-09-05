import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/cotton/64/car--v3.png', // Example vehicle icon
  iconSize: [32, 32],
});

// Coordinates for the vehicle route (Delhi, Noida, Gurgaon)
const pathCoordinates = [
    [28.4595, 77.0266], // Gurgaon
    [28.5355, 77.3910], // Noida
    [28.7041, 77.1025], // Delhi
];

// Function to calculate intermediate points between two coordinates
const interpolatePoints = (start, end, steps) => {
  const latStep = (end[0] - start[0]) / steps;
  const lngStep = (end[1] - start[1]) / steps;
  const points = [];

  for (let i = 0; i <= steps; i++) {
    const lat = start[0] + latStep * i;
    const lng = start[1] + lngStep * i;
    points.push([lat, lng]);
  }

  return points;
};

const MapComponent = () => {
  const [vehiclePosition, setVehiclePosition] = useState(pathCoordinates[0]);
  const [interpolatedPath, setInterpolatedPath] = useState([]);
  const [isMoving, setIsMoving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1); // Speed state to control interval
  const intervalRef = useRef(null);

  // Prepare the interpolated path
  useEffect(() => {
    const totalInterpolatedPath = [];
    const steps = 100; // Number of steps between each pair of coordinates for smooth movement

    for (let i = 0; i < pathCoordinates.length - 1; i++) {
      const start = pathCoordinates[i];
      const end = pathCoordinates[i + 1];
      const points = interpolatePoints(start, end, steps);
      totalInterpolatedPath.push(...points);
    }

    setInterpolatedPath(totalInterpolatedPath);
  }, []);

  // Move the vehicle smoothly along the interpolated path based on speed
  useEffect(() => {
    if (isMoving && interpolatedPath.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep < interpolatedPath.length - 1) {
            return prevStep + 1;
          } else {
            clearInterval(intervalRef.current);
            return prevStep; // Stop at the last point
          }
        });
      }, 1000 / speed); // Update interval depends on speed
    }

    return () => clearInterval(intervalRef.current);
  }, [isMoving, interpolatedPath, speed]);

  // Start the vehicle movement
  const handleStartMovement = () => {
    if (!isMoving) {
      setIsMoving(true);
    }
  };

  // Speed control handler
  const handleSpeedChange = (event) => {
    setSpeed(parseInt(event.target.value, 10));
  };

  return (
    <div>
      <MapContainer center={vehiclePosition} zoom={10} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={interpolatedPath[currentStep] || pathCoordinates[0]} icon={vehicleIcon} />
        <Polyline positions={pathCoordinates} color="blue" />
      </MapContainer>

      <button onClick={handleStartMovement} style={{ marginTop: '20px' }}>
        Start Vehicle Movement
      </button>

      <div style={{ marginTop: '20px' }}>
        <label>Speed Control: {speed}x</label>
        <input
          type="range"
          min="1"
          max="10"
          value={speed}
          onChange={handleSpeedChange}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
};

export default MapComponent;
