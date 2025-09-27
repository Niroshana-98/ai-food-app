import { Suspense } from 'react';
import OrderSuccessContent from './OrderSuccessContent';

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Order Details</h2>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}