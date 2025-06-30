import { useQuery } from "@tanstack/react-query";
import { isAlphaTestingMode } from "@/lib/alphaTestingMode";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // In alpha testing mode, always return authenticated state
  if (isAlphaTestingMode()) {
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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}