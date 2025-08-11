// Unified data storage interface that works with both localStorage and database
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { localStorage as localData } from "./localDataStorage";
import { useAuth } from "@/hooks/useAuth";

// Storage mode detection
export function useStorageMode() {
  const { isAuthenticated } = useAuth();
  
  // Check if user has migrated to database storage
  const { data: migrationStatus } = useQuery({
    queryKey: ['/api/migrate/check'],
    enabled: isAuthenticated,
    retry: false,
  });

  const shouldUseDatabase = isAuthenticated && migrationStatus && !(migrationStatus as any)?.migrationNeeded;
  
  return {
    useDatabase: shouldUseDatabase,
    useLocalStorage: !shouldUseDatabase,
    isAuthenticated,
  };
}

// Unified plants hook that works with both storage modes
export function usePlants() {
  const { useDatabase, useLocalStorage } = useStorageMode();
  const queryClient = useQueryClient();

  // Database query
  const databaseQuery = useQuery({
    queryKey: ['/api/plants'],
    enabled: useDatabase,
  });

  // Local storage query
  const localQuery = useQuery({
    queryKey: ['local-plants'],
    queryFn: () => {
      const plants = localData.get('plants') || [];
      return plants;
    },
    enabled: useLocalStorage as boolean,
    refetchInterval: 1000, // Poll for changes
  });

  // Use appropriate query based on storage mode
  const query = useDatabase ? databaseQuery : localQuery;

  // Mutations that work for both modes
  const createPlantMutation = useMutation({
    mutationFn: async (plantData: any) => {
      if (useDatabase) {
        return apiRequest('/api/plants', 'POST', plantData);
      } else {
        // Local storage creation logic
        const plants = localData.get('plants') || [];
        const newPlant = {
          ...plantData,
          id: Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        plants.push(newPlant);
        localData.set('plants', plants);
        return newPlant;
      }
    },
    onSuccess: () => {
      if (useDatabase) {
        queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['local-plants'] });
      }
    },
  });

  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      if (useDatabase) {
        return apiRequest(`/api/plants/${id}`, 'PUT', data);
      } else {
        // Local storage update logic
        const plants = localData.get('plants') || [];
        const index = plants.findIndex((p: any) => p.id === id);
        if (index !== -1) {
          plants[index] = { ...plants[index], ...data, updatedAt: new Date().toISOString() };
          localData.set('plants', plants);
          return plants[index];
        }
        throw new Error('Plant not found');
      }
    },
    onSuccess: () => {
      if (useDatabase) {
        queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['local-plants'] });
      }
    },
  });

  const deletePlantMutation = useMutation({
    mutationFn: async (id: number) => {
      if (useDatabase) {
        return apiRequest(`/api/plants/${id}`, 'DELETE');
      } else {
        // Local storage deletion logic
        const plants = localData.get('plants') || [];
        const filteredPlants = plants.filter((p: any) => p.id !== id);
        localData.set('plants', filteredPlants);
        
        // Also delete related care logs
        const logTypes = ['wateringLogs', 'feedingLogs', 'repottingLogs', 'soilTopUpLogs', 'pruningLogs'];
        logTypes.forEach(logType => {
          const logs = localData.get(logType) || [];
          const filteredLogs = logs.filter((log: any) => log.plantId !== id);
          localData.set(logType, filteredLogs);
        });
        
        return true;
      }
    },
    onSuccess: () => {
      if (useDatabase) {
        queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['local-plants'] });
      }
    },
  });

  return {
    plants: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    createPlant: createPlantMutation.mutateAsync,
    updatePlant: updatePlantMutation.mutateAsync,
    deletePlant: deletePlantMutation.mutateAsync,
    isCreating: createPlantMutation.isPending,
    isUpdating: updatePlantMutation.isPending,
    isDeleting: deletePlantMutation.isPending,
    storageMode: useDatabase ? 'database' : 'localStorage',
  };
}

// Care logs hooks
export function useCareLogsForPlant(plantId: number, logType: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning') {
  const { useDatabase } = useStorageMode();
  const queryClient = useQueryClient();

  const apiEndpoint = `/api/plants/${plantId}/${logType}-logs`;
  const localKey = `${logType}Logs`;

  // Database query
  const databaseQuery = useQuery({
    queryKey: [apiEndpoint],
    enabled: useDatabase && !!plantId,
  });

  // Local storage query
  const localQuery = useQuery({
    queryKey: ['local-care-logs', plantId, logType],
    queryFn: () => {
      const logs = localData.get(localKey) || [];
      return logs.filter((log: any) => log.plantId === plantId);
    },
    enabled: (!useDatabase && !!plantId) as boolean,
  });

  const query = useDatabase ? databaseQuery : localQuery;

  const addLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      if (useDatabase) {
        return apiRequest(apiEndpoint, 'POST', logData);
      } else {
        // Local storage logic
        const logs = localData.get(localKey) || [];
        const newLog = {
          ...logData,
          id: Date.now(),
          plantId,
          createdAt: new Date().toISOString(),
        };
        logs.push(newLog);
        localData.set(localKey, logs);
        return newLog;
      }
    },
    onSuccess: () => {
      if (useDatabase) {
        queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
        queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['local-care-logs', plantId, logType] });
        queryClient.invalidateQueries({ queryKey: ['local-plants'] });
      }
    },
  });

  return {
    logs: query.data || [],
    isLoading: query.isLoading,
    addLog: addLogMutation.mutateAsync,
    isAdding: addLogMutation.isPending,
  };
}