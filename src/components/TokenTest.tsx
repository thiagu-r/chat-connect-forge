import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TokenUtils } from '@/lib/tokenUtils';
import { useAuth } from '@/contexts/AuthContext';

export const TokenTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { isAuthenticated } = useAuth();

  const testTokenRefresh = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const response = await TokenUtils.testTokenRefresh();
      setResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenStatus = () => {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    if (!accessToken) {
      setError('No access token found');
      return;
    }

    const isExpired = TokenUtils.isTokenExpired(accessToken);
    const expiration = TokenUtils.getTokenExpiration(accessToken);
    const timeUntilExpiration = TokenUtils.getTimeUntilExpiration(accessToken);

    setResult(JSON.stringify({
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      isExpired,
      expiration: expiration?.toISOString(),
      timeUntilExpiration: `${Math.floor(timeUntilExpiration / 60)} minutes`,
      tokenPreview: accessToken.substring(0, 50) + '...'
    }, null, 2));
  };

  const forceRefresh = async () => {
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      await TokenUtils.forceRefreshToken();
      setResult('Token refreshed successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Token Test</CardTitle>
          <CardDescription>Please log in to test token functionality</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Refresh Test</CardTitle>
        <CardDescription>Test the token refresh functionality</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={checkTokenStatus} variant="outline">
            Check Token Status
          </Button>
          <Button onClick={testTokenRefresh} disabled={isLoading}>
            {isLoading ? 'Testing...' : 'Test Token Refresh'}
          </Button>
          <Button onClick={forceRefresh} disabled={isLoading} variant="secondary">
            Force Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Result:</h4>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 