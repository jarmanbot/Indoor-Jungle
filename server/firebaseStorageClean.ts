import { db, getUserPlantsCollection, getUserCareLogsCollection } from './firebase';

export interface FirebasePlantData {
  id: string;
  name: string;
  userId: string;
  plantNumber: number;
  babyName?: string;
  commonName?: string;
  latinName?: string | null;
  location?: string;
  lastWatered?: Date | null;
  nextCheck?: Date | null;
  lastFed?: Date | null;
  wateringFrequencyDays?: number;
  feedingFrequencyDays?: number;
  notes?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlantData {
  name: string;
  userId: string;
  babyName?: string;
  commonName?: string;
  latinName?: string | null;
  location?: string;
  lastWatered?: Date | null;
  nextCheck?: Date | null;
  lastFed?: Date | null;
  wateringFrequencyDays?: number;
  feedingFrequencyDays?: number;
  notes?: string | null;
  imageUrl?: string | null;
  status?: string | null;
}

export interface FirebaseCareLogData {
  id: string;
  plantId: string;
  userId: string;
  date: Date;
  notes?: string | null;
  createdAt: Date;
}

export interface CreateCareLogData {
  plantId: string;
  userId: string;
  date: Date;
  notes?: string | null;
}

export interface FirebaseUserData {
  id: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  profileImageUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class FirebaseStorage {
  async getPlants(userId: string): Promise<FirebasePlantData[]> {
    const plantsRef = getUserPlantsCollection(userId);
    const snapshot = await plantsRef.orderBy('plantNumber', 'asc').get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastWatered: data.lastWatered?.toDate() || null,
        lastFed: data.lastFed?.toDate() || null,
        nextCheck: data.nextCheck?.toDate() || null,
      } as FirebasePlantData;
    });
  }

  async getPlant(userId: string, plantId: string): Promise<FirebasePlantData | null> {
    const plantRef = getUserPlantsCollection(userId).doc(plantId);
    const doc = await plantRef.get();
    
    if (!doc.exists) return null;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastWatered: data.lastWatered?.toDate() || null,
      lastFed: data.lastFed?.toDate() || null,
      nextCheck: data.nextCheck?.toDate() || null,
    } as FirebasePlantData;
  }

  async createPlant(userId: string, plant: CreatePlantData): Promise<FirebasePlantData> {
    const plantsRef = getUserPlantsCollection(userId);
    
    // Get next plant number
    const plantsSnapshot = await plantsRef.orderBy('plantNumber', 'desc').limit(1).get();
    const nextPlantNumber = plantsSnapshot.empty ? 1 : (plantsSnapshot.docs[0].data().plantNumber || 0) + 1;
    
    const now = new Date();
    const plantData = {
      ...plant,
      plantNumber: nextPlantNumber,
      createdAt: now,
      updatedAt: now,
      lastWatered: plant.lastWatered || null,
      lastFed: plant.lastFed || null,
      nextCheck: plant.nextCheck || null,
    };

    const docRef = await plantsRef.add(plantData);
    
    return {
      id: docRef.id,
      ...plantData,
    } as FirebasePlantData;
  }

  async updatePlant(userId: string, plantId: string, updates: Partial<CreatePlantData>): Promise<FirebasePlantData> {
    const plantRef = getUserPlantsCollection(userId).doc(plantId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await plantRef.update(updateData);
    
    const updatedDoc = await plantRef.get();
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastWatered: data.lastWatered?.toDate() || null,
      lastFed: data.lastFed?.toDate() || null,
      nextCheck: data.nextCheck?.toDate() || null,
    } as FirebasePlantData;
  }

  async deletePlant(userId: string, plantId: string): Promise<void> {
    const batch = db.batch();
    
    // Delete the plant
    const plantRef = getUserPlantsCollection(userId).doc(plantId);
    batch.delete(plantRef);
    
    // Delete all care logs for this plant
    const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
    
    for (const logType of logTypes) {
      const logsRef = getUserCareLogsCollection(userId, logType);
      const logsSnapshot = await logsRef.where('plantId', '==', plantId).get();
      
      logsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
    }
    
    await batch.commit();
  }

  async getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<FirebaseCareLogData[]> {
    const logsRef = getUserCareLogsCollection(userId, logType);
    const snapshot = await logsRef
      .where('plantId', '==', plantId)
      .orderBy('date', 'desc')
      .get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        plantId: data.plantId,
        userId: data.userId,
        date: data.date?.toDate() || new Date(),
        notes: data.notes || null,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as FirebaseCareLogData;
    });
  }

  async addCareLog(userId: string, logType: string, logData: CreateCareLogData): Promise<FirebaseCareLogData> {
    const logsRef = getUserCareLogsCollection(userId, logType);
    
    const now = new Date();
    const data = {
      ...logData,
      createdAt: now,
      date: logData.date || now,
    };

    const docRef = await logsRef.add(data);
    
    return {
      id: docRef.id,
      ...data,
    } as FirebaseCareLogData;
  }

  async getUser(userId: string): Promise<FirebaseUserData | null> {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) return null;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FirebaseUserData;
  }

  async createUser(userData: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    profileImageUrl?: string | null;
  }): Promise<FirebaseUserData> {
    const userRef = db.collection('users').doc(userData.id);
    
    const now = new Date();
    const data = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(data);
    
    return data as FirebaseUserData;
  }

  async updateUser(userId: string, updates: Partial<FirebaseUserData>): Promise<FirebaseUserData> {
    const userRef = db.collection('users').doc(userId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    const data = updatedDoc.data()!;
    return {
      id: updatedDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as FirebaseUserData;
  }
}

export const firebaseStorage = new FirebaseStorage();