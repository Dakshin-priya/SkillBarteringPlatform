import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

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
          setUserLocation({ lat: data.latitude, lng: data.longitude });
        } else {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
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
                }, { merge: true });
                setUserLocation({ lat: latitude, lng: longitude });
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