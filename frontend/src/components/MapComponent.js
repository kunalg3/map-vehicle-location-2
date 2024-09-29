import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import './MapComponent.css'; // Import the external CSS file

// Custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/cotton/64/car--v3.png', // Example vehicle icon
  iconSize: [32, 32],
});

const MapComponent = () => {
  const [route, setRoute] = useState([]); // Route array
  const [isMoving, setIsMoving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1); // Speed state to control interval
  const intervalRef = useRef(null);

  // Fetch dummy route data from backend API
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/route'); // Fetch dummy data from the backend
        const routeData = response.data;
        const formattedCoordinates = routeData.map(point => [point.latitude, point.longitude]);
        setRoute(formattedCoordinates);
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, []);

  // Move the vehicle along the route
  useEffect(() => {
    if (isMoving && route.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prevStep) => {
          if (prevStep < route.length - 1) {
            return prevStep + 1;
          } else {
            clearInterval(intervalRef.current);
            return prevStep; // Stop at the last point
          }
        });
      }, 1000 / speed); // Update interval depends on speed
    }

    return () => clearInterval(intervalRef.current);
  }, [isMoving, route, speed]);

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
    <div className="container">
      <MapContainer className="map" center={[17.385044, 78.486671]} zoom={10}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Show the vehicle moving along the route */}
        <Marker position={route[currentStep] || [17.385044, 78.486671]} icon={vehicleIcon} />
        <Polyline positions={route} color="blue" />
      </MapContainer>

      <div className="controls">
        <button className="start-button" onClick={handleStartMovement}>
          Start Vehicle
        </button>

        <div className="speed-control">
          <label>Speed Control: {speed}x</label>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={handleSpeedChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
