import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiService } from '@/lib/api';

export const useApi = () => {
  const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
    return apiService.makeAuthenticatedRequest(endpoint, options);
  };

  const useAuthenticatedQuery = <T>(
    key: string[],
    endpoint: string,
    options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
  ) => {
    return useQuery({
      queryKey: key,
      queryFn: () => makeAuthenticatedRequest(endpoint) as Promise<T>,
      ...options,
    });
  };

  const useAuthenticatedMutation = <T, V>(
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
    options?: Omit<UseMutationOptions<T, Error, V>, 'mutationFn'>
  ) => {
    return useMutation({
      mutationFn: (data: V) =>
        makeAuthenticatedRequest(endpoint, {
          method,
          body: JSON.stringify(data),
        }) as Promise<T>,
      ...options,
    });
  };

  return {
    makeAuthenticatedRequest,
    useAuthenticatedQuery,
    useAuthenticatedMutation,
  };
}; 