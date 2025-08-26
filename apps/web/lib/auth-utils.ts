// Authentication utility functions

export const clearAllAuthCaches = () => {
  // Clear localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('nextauth.message');
  
  // Clear sessionStorage
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  
  // Clear NextAuth cookies and session storage
  const keysToRemove = Object.keys(localStorage).filter(key => 
    key.startsWith('nextauth.') || 
    key.startsWith('__Secure-next-auth.') ||
    key.startsWith('next-auth.')
  );
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear session storage NextAuth keys
  const sessionKeysToRemove = Object.keys(sessionStorage).filter(key => 
    key.startsWith('nextauth.') || 
    key.startsWith('__Secure-next-auth.') ||
    key.startsWith('next-auth.')
  );
  
  sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));
  
  console.log('🧹 All authentication caches cleared');
};

export const getDashboardRoute = (role: string): string => {
  switch (role) {
    case 'CLIENT':
      return '/client/dashboard';
    case 'APPLICANT':
      return '/applicant/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    default:
      return '/dashboard';
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'CLIENT':
      return 'Employer';
    case 'APPLICANT':
      return 'Job Seeker';
    case 'ADMIN':
      return 'Administrator';
    default:
      return 'User';
  }
};