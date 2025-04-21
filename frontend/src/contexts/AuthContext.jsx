import { createContext, useState, useRef } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const loginUsernameRef = useRef(null);
  const loginPasswordRef = useRef(null);
  const registerUsernameRef = useRef(null);
  const registerPasswordRef = useRef(null);

  async function login(username, password) {
    try {
      const response = await fetch('http://localhost:8000/api-token-auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setToken(data.token);

      const userResponse = await fetch('http://localhost:8000/api/user/me/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + data.token,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await userResponse.json();
      setUser(userData);

    } catch (error) {
      console.error('Login error:', error);
    }
  }

  async function register(username, password) {
    try {
      // Step 1: Register the user
      const response = await fetch('http://localhost:8000/api/user/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        // Check if the response is JSON
        const contentType = response.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Register failed');
        } else {
          // Handle unexpected responses
          throw new Error(`Unexpected response: ${response.statusText}`);
        }
      }
  
      const data = await response.json();
      console.log('User created successfully:', data.username);

      await login(username, password);
  
    } catch (error) {
      console.error('Register error:', error.message);
    }
  }

  function logout() {
    setToken(null);
    setUser(null);
    console.log('Logged out successfully');
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, user, setUser, loginUsernameRef, loginPasswordRef, registerUsernameRef, registerPasswordRef, register }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthProvider;