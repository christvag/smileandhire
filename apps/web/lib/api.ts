// API URL helper
export const getApiUrl = () => {
  // Use environment variable if available, otherwise fallback to localhost for development
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3006';
};

export const API_URL = getApiUrl();