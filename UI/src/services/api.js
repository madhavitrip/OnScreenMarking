// Centralized API configuration
const API_URL = import.meta.env.VITE_API_URL;

const getToken = () => localStorage.getItem('token');

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorObj = await response.json();
      errorMessage = errorObj.message || errorMessage;
    } catch (e) {
      try {
        const text = await response.text();
        if (text) {
          // If it's a short text message, use it
          errorMessage = text.length < 200 ? text : `HTTP error! status: ${response.status}`;
        }
      } catch (textErr) {}
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

const apiCall = async (endpoint, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

export default apiCall;
