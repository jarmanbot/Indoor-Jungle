// Firebase real-time data storage for plant care app
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./queryClient";
import { useAuth } from "@/hooks/useAuth";

// Hook to use Firebase storage for plants
export function useFirebasePlants() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Get all plants from Firebase
  const plantsQuery = useQuery({
    queryKey: ['/api/plants'],
    enabled: isAuthenticated,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Create plant mutation
  const createPlantMutation = useMutation({
    mutationFn: async (plantData: any) => {
      return apiRequest('/api/plants', 'POST', plantData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    },
  });

  // Update plant mutation
  const updatePlantMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return apiRequest(`/api/plants/${id}`, 'PUT', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    },
  });

  // Delete plant mutation
  const deletePlantMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/plants/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    },
  });

  return {
    plants: plantsQuery.data || [],
    isLoading: plantsQuery.isLoading,
    error: plantsQuery.error,
    createPlant: createPlantMutation.mutateAsync,
    updatePlant: updatePlantMutation.mutateAsync,
    deletePlant: deletePlantMutation.mutateAsync,
    isCreating: createPlantMutation.isPending,
    isUpdating: updatePlantMutation.isPending,
    isDeleting: deletePlantMutation.isPending,
    storageMode: 'firebase' as const,
  };
}

// Hook to use Firebase storage for care logs
export function useFirebaseCareLogsForPlant(plantId: string, logType: 'watering' | 'feeding' | 'repotting' | 'soilTopUp' | 'pruning') {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const apiEndpoint = `/api/plants/${plantId}/${logType}-logs`;

  // Get care logs from Firebase
  const logsQuery = useQuery({
    queryKey: [apiEndpoint],
    enabled: isAuthenticated && !!plantId,
  });

  // Add care log mutation
  const addLogMutation = useMutation({
    mutationFn: async (logData: any) => {
      return apiRequest(apiEndpoint, 'POST', logData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [apiEndpoint] });
      queryClient.invalidateQueries({ queryKey: ['/api/plants'] });
    },
  });

  return {
    logs: logsQuery.data || [],
    isLoading: logsQuery.isLoading,
    addLog: addLogMutation.mutateAsync,
    isAdding: addLogMutation.isPending,
  };
}

// Hook to check migration status
export function useMigrationStatus() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['/api/migrate/check'],
    enabled: isAuthenticated,
    retry: false,
  });
}