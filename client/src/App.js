
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import LeadsList from './components/LeadsList';
import LeadForm from './components/LeadForm';
import './App.css';

// Set axios base URL from environment variable or default to relative path
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || '/';
axios.defaults.withCredentials = true;

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const response = await axios.post('/api/auth/login', userData);
      // If backend sends JWT in response.data.token, store it in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      // Log error for debugging
      console.error('Login error:', error, error.response);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/api/auth/register', userData);
      // If backend sends JWT in response.data.token, store it in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      // Log error for debugging
      console.error('Register error:', error, error.response);
      throw error;
    }
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        <Toaster position="top-right" />
        <Header user={user} onLogout={logout} />
        <div className="container">
          <Routes>
            <Route 
              path="/login" 
              element={user ? <Navigate to="/leads" /> : <Login onLogin={login} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/leads" /> : <Register onRegister={register} />} 
            />
            <Route 
              path="/leads" 
              element={user ? <LeadsList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/leads/new" 
              element={user ? <LeadForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/leads/:id/edit" 
              element={user ? <LeadForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={<Navigate to={user ? "/leads" : "/login"} />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
