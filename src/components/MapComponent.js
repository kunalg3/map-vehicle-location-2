import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';

// Custom icon for the vehicle
const vehicleIcon = new L.Icon({
  iconUrl: 'https://img.icons8.com/cotton/64/car--v3.png', // Example vehicle icon
  iconSize: [32, 32],
});

const API_KEY = process.env.REACT_APP_OPENROUTESERVICE_API_KEY;

const MapComponent = () => {
  const [route, setRoute] = useState([]); // Removed vehiclePosition
  const [isMoving, setIsMoving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speed, setSpeed] = useState(1); // Speed state to control interval
  const intervalRef = useRef(null);

  // Fetch route using OpenRouteService API
  useEffect(() => {
    const fetchRoute = async () => {
      const start = [77.0266, 28.4595]; // Start: Gurgaon [lng, lat]
      const end = [77.1025, 28.7041]; // End: Delhi [lng, lat]

      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${API_KEY}&start=${start}&end=${end}`;

      try {
        const response = await axios.get(url);
        const coordinates = response.data.features[0].geometry.coordinates;
        const formattedCoordinates = coordinates.map(([lng, lat]) => [lat, lng]); // Swap [lng, lat] to [lat, lng]
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
    <div>
      <MapContainer center={[28.4595, 77.0266]} zoom={10} style={{ height: '500px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={route[currentStep] || [28.4595, 77.0266]} icon={vehicleIcon} />
        <Polyline positions={route} color="blue" />
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
