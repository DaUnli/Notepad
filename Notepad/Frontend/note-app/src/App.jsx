import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import AuthCheck from './components/AuthCheck/AuthCheck'; // ✅ import this

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Protected route */}
        <Route
          path="/dashboard"
          element={
            <AuthCheck>
              <Home />
            </AuthCheck>
          }
        />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};

export default App;
