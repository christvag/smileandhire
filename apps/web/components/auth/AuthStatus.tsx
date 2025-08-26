'use client';

import { useNextAuth } from '../../contexts/NextAuthContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthStatus() {
  const { user: nextAuthUser, isAuthenticated: nextAuthIsAuthenticated } = useNextAuth();
  const { user: authUser, isAuthenticated: authIsAuthenticated } = useAuth();
  
  // Use NextAuth if available, fallback to old Auth
  const user = nextAuthUser || authUser;
  const isAuthenticated = nextAuthIsAuthenticated() || authIsAuthenticated();

  if (!isAuthenticated) {
    return (
      <div id="auth-status" className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <p className="text-yellow-800 text-sm">
          🔒 <strong>Not logged in</strong> - Buttons will show "Sign Up to Apply"
        </p>
      </div>
    );
  }

  return (
    <div id="auth-status" className="bg-green-50 border border-green-200 rounded-lg p-3">
      <p className="text-green-800 text-sm">
        ✅ <strong>Logged in as:</strong> {user?.firstName || user?.name || user?.email} 
        <span className="ml-2 bg-green-100 px-2 py-1 rounded text-xs">
          {user?.role}
        </span>
        {user?.role === 'APPLICANT' && (
          <span className="ml-2 text-green-600">- Buttons will show "Apply Now"</span>
        )}
      </p>
    </div>
  );
}