import { useQuery } from "@tanstack/react-query";
import { isAlphaTestingMode } from "@/lib/alphaTestingMode";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const alphaMode = isAlphaTestingMode();
  console.log("useAuth Debug - Alpha mode:", alphaMode);
  console.log("useAuth Debug - Query user:", user);
  console.log("useAuth Debug - Query isLoading:", isLoading);

  // In alpha testing mode, always return authenticated state
  if (alphaMode) {
    console.log("useAuth Debug - Returning alpha user");
    return {
      user: {
        id: 'alpha-user',
        name: 'Alpha Tester',
        email: 'alpha@test.local',
        image: null
      },
      isLoading: false,
      isAuthenticated: true,
    };
  }

  console.log("useAuth Debug - Returning regular auth, isAuthenticated:", !!user);
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}