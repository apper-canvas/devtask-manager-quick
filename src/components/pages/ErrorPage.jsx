import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const ErrorPage = () => {
  const [searchParams] = useSearchParams();
  const errorMessage = searchParams.get('message') || 'An error occurred';
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8 bg-surface rounded-lg shadow-lg text-center border border-gray-600">
        <h1 className="text-2xl font-bold text-error mb-4">Authentication Error</h1>
        <p className="text-gray-300 mb-6">{errorMessage}</p>
        <Link to="/login" className="inline-block px-6 py-3 bg-primary text-background rounded-md hover:bg-primary/90 transition-colors">
          Return to Login
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;