import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import AuthGuard from './components/AuthGuard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protect the dashboard */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        {/* Redirect unknown routes to login */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
