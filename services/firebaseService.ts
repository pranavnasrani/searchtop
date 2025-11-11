

import { collection, getDocs, Timestamp, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
// FIX: Import LaptopData from the centralized types.ts file.
import { Laptop, LaptopData } from '../types';

// FIX: Removed the LaptopData type definition as it has been moved to types.ts.
// Type for data when creating/updating a laptop, excluding read-only fields
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
    return [];
  }
};

export const addLaptop = async (laptopData: LaptopData): Promise<void> => {
  try {
    const laptopsCollection = collection(db, 'laptops');
    await addDoc(laptopsCollection, {
      ...laptopData,
      last_updated: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding laptop to Firestore:", error);
    throw error;
  }
};

export const updateLaptop = async (id: string, laptopData: Partial<LaptopData>): Promise<void> => {
  try {
    const laptopDoc = doc(db, 'laptops', id);
    await updateDoc(laptopDoc, {
        ...laptopData,
        last_updated: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating laptop in Firestore:", error);
    throw error;
  }
};

export const deleteLaptop = async (id: string): Promise<void> => {
  try {
    const laptopDoc = doc(db, 'laptops', id);
    await deleteDoc(laptopDoc);
  } catch (error) {
    console.error("Error deleting laptop from Firestore:", error);
    throw error;
  }
};