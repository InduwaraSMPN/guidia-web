import { AvailabilityTester } from '@/components/meetings/AvailabilityTester';

export default function TestAvailabilityPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Test Availability</h1>
      <AvailabilityTester />
    </div>
  );
}
