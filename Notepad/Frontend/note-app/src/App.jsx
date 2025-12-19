import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Layout from './components/Layout/Layout';
import GuestCheck from './components/GuestCheck/GuestCheck';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Routes for non-logged-in users */}
        <Route
          path="/login"
          element={
            <GuestCheck>
              <Login />
            </GuestCheck>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestCheck>
              <Signup />
            </GuestCheck>
          }
        />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Home />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
