import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { isAlphaTestingMode, alphaStorage, getNextId, getNextPlantNumber } from "./alphaTestingMode";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Alpha testing localStorage handlers
function handleAlphaRequest(method: string, url: string, data?: unknown): any {
  const urlParts = url.split('/');
  const endpoint = urlParts.slice(2).join('/'); // Remove /api prefix
  
  if (endpoint === 'plants') {
    if (method === 'GET') {
      return alphaStorage.get('plants') || [];
    }
    // Handle FormData plant creation (with images)
    if (method === 'POST') {
      const plants = alphaStorage.get('plants') || [];
      const plantData = data as any;
      const newPlant = {
        ...plantData,
        id: getNextId(),
        plantNumber: getNextPlantNumber(),
        name: plantData?.babyName || plantData?.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      plants.push(newPlant);
      alphaStorage.set('plants', plants);
      return newPlant;
    }
  }
  
  if (endpoint === 'plants/json' && method === 'POST') {
    const plants = alphaStorage.get('plants') || [];
    const plantData = data as any;
    const newPlant = {
      ...plantData,
      id: getNextId(),
      plantNumber: getNextPlantNumber(),
      name: plantData?.babyName || plantData?.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    plants.push(newPlant);
    alphaStorage.set('plants', plants);
    return newPlant;
  }
  
  if (endpoint.startsWith('plants/') && endpoint.includes('/watering-logs')) {
    const plantId = parseInt(urlParts[3]);
    if (method === 'GET') {
      const logs = alphaStorage.get('wateringLogs') || [];
      return logs.filter((log: any) => log.plantId === plantId);
    }
    if (method === 'POST') {
      const logs = alphaStorage.get('wateringLogs') || [];
      const logData = (data as any) || {};
      const newLog = {
        ...logData,
        id: getNextId(),
        plantId,
        createdAt: new Date().toISOString()
      };
      logs.push(newLog);
      alphaStorage.set('wateringLogs', logs);
      
      // Update plant's lastWatered
      const plants = alphaStorage.get('plants') || [];
      const plantIndex = plants.findIndex((p: any) => p.id === plantId);
      if (plantIndex !== -1) {
        plants[plantIndex].lastWatered = (data as any).wateredAt;
        alphaStorage.set('plants', plants);
      }
      
      return newLog;
    }
  }
  
  if (endpoint.startsWith('plants/') && endpoint.includes('/feeding-logs')) {
    const plantId = parseInt(urlParts[3]);
    if (method === 'GET') {
      const logs = alphaStorage.get('feedingLogs') || [];
      return logs.filter((log: any) => log.plantId === plantId);
    }
    if (method === 'POST') {
      const logs = alphaStorage.get('feedingLogs') || [];
      const logData = (data as any) || {};
      const newLog = {
        ...logData,
        id: getNextId(),
        plantId,
        createdAt: new Date().toISOString()
      };
      logs.push(newLog);
      alphaStorage.set('feedingLogs', logs);
      
      // Update plant's lastFed
      const plants = alphaStorage.get('plants') || [];
      const plantIndex = plants.findIndex((p: any) => p.id === plantId);
      if (plantIndex !== -1) {
        plants[plantIndex].lastFed = (data as any).fedAt;
        alphaStorage.set('plants', plants);
      }
      
      return newLog;
    }
  }
  
  if (endpoint === 'locations') {
    if (method === 'GET') {
      return alphaStorage.get('customLocations') || [];
    }
    if (method === 'POST') {
      const locations = alphaStorage.get('customLocations') || [];
      const locationData = (data as any) || {};
      const newLocation = {
        ...locationData,
        id: getNextId(),
        createdAt: new Date().toISOString()
      };
      locations.push(newLocation);
      alphaStorage.set('customLocations', locations);
      return newLocation;
    }
  }
  
  // Default: return empty response for unhandled endpoints
  return {};
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Intercept API calls in alpha testing mode
  if (isAlphaTestingMode()) {
    const result = handleAlphaRequest(method, url, data);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    // Intercept queries in alpha testing mode
    if (isAlphaTestingMode()) {
      const result = handleAlphaRequest('GET', url);
      return result;
    }

    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: isAlphaTestingMode() ? 0 : Infinity, // No cache in alpha mode to ensure fresh data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
