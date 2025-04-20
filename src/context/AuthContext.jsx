import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

const getCityFromCoordinates = async (latitude, longitude) => {
  // You can replace this URL with your preferred reverse geocoding service
  const apiKey = '7f103b38b88e3e9d9573fedd1fe9bdef'; // 🔁 Replace this with your OpenWeather API key
  const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === 'OK') {
      const city = data.results.find((result) =>
        result.types.includes('locality')
      );
      return city ? city.formatted_address : null;
    }
  } catch (error) {
    console.error('Error fetching city name:', error);
  }
  return null;
};

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserLocation({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city, // Include city from Firestore
          });
        } else {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const city = await getCityFromCoordinates(latitude, longitude);
                await setDoc(doc(db, 'users', user.uid), {
                  displayName: '',
                  email: '',
                  phoneNumber: '',
                  linkedin: '',
                  instagram: '',
                  profilePicture: '',
                  skillsOffered: [],
                  skillsNeeded: [],
                  points: 0,
                  latitude,
                  longitude,
                  city, // Store city in Firestore
                }, { merge: true });
                setUserLocation({ lat: latitude, lng: longitude, city });
              },
              (error) => {
                console.error('Geolocation error:', error);
                setUserLocation(null);
              }
            );
          }
        }
      } else {
        setCurrentUser(null);
        setUserLocation(null);
      }
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userLocation, setUserLocation }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { AuthContext };
