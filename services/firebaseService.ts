
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { Laptop } from '../types';

export const fetchLaptops = async (): Promise<Laptop[]> => {
  try {
    const laptopsCollection = collection(db, 'laptops');
    const laptopSnapshot = await getDocs(laptopsCollection);
    
    if (laptopSnapshot.empty) {
      console.warn("No laptops found in Firestore. The app might not display any data.");
      return [];
    }

    const laptopList = laptopSnapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore Timestamps need to be converted to JS Dates
      const lastUpdated = data.last_updated && data.last_updated instanceof Timestamp 
        ? data.last_updated.toDate() 
        : new Date();
      
      return {
        ...data,
        id: doc.id,
        last_updated: lastUpdated,
      } as Laptop;
    });
    
    return laptopList;
  } catch (error) {
    console.error("Error fetching laptops from Firestore:", error);
    // Returning an empty array to prevent the app from crashing.
    // The UI should handle the empty state.
    return [];
  }
};
