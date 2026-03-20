import { Suspense } from 'react';
import SignupForm from './SignupForm';

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="spinner" />
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
