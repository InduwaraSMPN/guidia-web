import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_URL } from '@/config';
import axios from 'axios';
import { getCompanyUserID } from '@/utils/companyUserMapping';

export function AvailabilityTester() {
  const [userId, setUserId] = useState('58'); // Default to CloudLink Sri Lanka
  const [companyId, setCompanyId] = useState('5'); // Default to CloudLink Sri Lanka company ID
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const testDayOfWeek = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/test/day-of-week/${date}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error testing day of week:', err);
    } finally {
      setLoading(false);
    }
  };

  const testAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/test/availability/${userId}/${date}`);
      setResult(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error testing availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const testRealAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${API_URL}/api/meeting/meetings/available-slots/${userId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(response.data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error testing real availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCompanyMapping = async () => {
    setLoading(true);
    setError(null);
    try {
      const mappedUserId = await getCompanyUserID(parseInt(companyId));
      setResult({
        companyId: parseInt(companyId),
        mappedUserId: mappedUserId,
        message: `Company ID ${companyId} maps to User ID ${mappedUserId}`
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error testing company mapping:', err);
    } finally {
      setLoading(false);
    }
  };

  const testCompanyAvailability = async () => {
    setLoading(true);
    setError(null);
    try {
      // First, map the company ID to user ID
      const mappedUserId = await getCompanyUserID(parseInt(companyId));

      // Then fetch availability using the mapped user ID
      const response = await axios.get(
        `${API_URL}/api/meeting/meetings/available-slots/${mappedUserId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult({
        companyId: parseInt(companyId),
        mappedUserId: mappedUserId,
        availabilityData: response.data
      });
    } catch (err: any) {
      setError(err.message);
      console.error('Error testing company availability:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Availability Tester</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">User ID</label>
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Company ID</label>
            <Input
              value={companyId}
              onChange={(e) => setCompanyId(e.target.value)}
              placeholder="Company ID"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Date</label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={testDayOfWeek} disabled={loading} size="sm">
            Test Day of Week
          </Button>
          <Button onClick={testAvailability} disabled={loading} size="sm">
            Test Availability
          </Button>
          <Button onClick={testRealAvailability} disabled={loading} size="sm">
            Test Real Availability
          </Button>
          <Button onClick={testCompanyMapping} disabled={loading} size="sm">
            Test Company Mapping
          </Button>
          <Button onClick={testCompanyAvailability} disabled={loading} size="sm">
            Test Company Availability
          </Button>
        </div>

        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded-md">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-gray-100 rounded-md">
            <p className="font-medium mb-2">Result:</p>
            <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
