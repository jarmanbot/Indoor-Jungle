import { db, getUserPlantsCollection, getUserCareLogsCollection } from './firebase';
import { FirebasePlant, InsertFirebasePlant, FirebaseUser, FirebaseCareLog, InsertFirebaseCareLog } from '@shared/firebaseSchema';

export interface IFirebaseStorage {
  // Plant operations
  getPlants(userId: string): Promise<FirebasePlant[]>;
  getPlant(userId: string, plantId: string): Promise<FirebasePlant | null>;
  createPlant(userId: string, plant: InsertFirebasePlant): Promise<FirebasePlant>;
  updatePlant(userId: string, plantId: string, updates: Partial<FirebasePlant>): Promise<FirebasePlant>;
  deletePlant(userId: string, plantId: string): Promise<void>;

  // Care log operations
  getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<FirebaseCareLog[]>;
  addCareLog(userId: string, logType: string, logData: InsertFirebaseCareLog): Promise<FirebaseCareLog>;

  // User operations
  getUser(userId: string): Promise<FirebaseUser | null>;
  createUser(userData: any): Promise<FirebaseUser>;
  updateUser(userId: string, updates: Partial<FirebaseUser>): Promise<FirebaseUser>;
}

export class FirebaseStorage implements IFirebaseStorage {
  async getPlants(userId: string): Promise<FirebasePlant[]> {
    const plantsRef = getUserPlantsCollection(userId);
    const snapshot = await plantsRef.orderBy('plantNumber', 'asc').get();
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
        lastWatered: data.lastWatered?.toDate() || null,
        lastFed: data.lastFed?.toDate() || null,
        nextCheck: data.nextCheck?.toDate() || null,
      } as unknown as FirebasePlant;
    });
  }

  async getPlant(userId: string, plantId: string): Promise<FirebasePlant | null> {
    const plantRef = getUserPlantsCollection(userId).doc(plantId);
    const doc = await plantRef.get();
    
    if (!doc.exists) return null;
    
    const data = doc.data()!;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastWatered: data.lastWatered?.toDate() || null,
      lastFed: data.lastFed?.toDate() || null,
      nextCheck: data.nextCheck?.toDate() || null,
    } as Plant;
  }

  async createPlant(userId: string, plant: InsertFirebasePlant): Promise<FirebasePlant> {
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
    } as unknown as FirebasePlant;
  }

  async updatePlant(userId: string, plantId: string, updates: Partial<FirebasePlant>): Promise<FirebasePlant> {
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
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
      lastWatered: data.lastWatered?.toDate() || null,
      lastFed: data.lastFed?.toDate() || null,
      nextCheck: data.nextCheck?.toDate() || null,
    } as Plant;
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

  async getCareLogsForPlant(userId: string, plantId: string, logType: string): Promise<any[]> {
    const logsRef = getUserCareLogsCollection(userId, logType);
    const snapshot = await logsRef
      .where('plantId', '==', plantId)
      .orderBy('date', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  }

  async addCareLog(userId: string, logType: string, logData: any): Promise<any> {
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
    };
  }

  async getUser(userId: string): Promise<User | null> {
    const userRef = db.collection('users').doc(userId);
    const doc = await userRef.get();
    
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data()?.createdAt?.toDate(),
      updatedAt: doc.data()?.updatedAt?.toDate(),
    } as User;
  }

  async createUser(userData: any): Promise<User> {
    const userRef = db.collection('users').doc(userData.id);
    
    const now = new Date();
    const data = {
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(data);
    
    return {
      id: userData.id,
      ...data,
    } as User;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userRef = db.collection('users').doc(userId);
    
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };

    await userRef.update(updateData);
    
    const updatedDoc = await userRef.get();
    return {
      id: updatedDoc.id,
      ...updatedDoc.data(),
      createdAt: updatedDoc.data()?.createdAt?.toDate(),
      updatedAt: updatedDoc.data()?.updatedAt?.toDate(),
    } as User;
  }
}

export const firebaseStorage = new FirebaseStorage();