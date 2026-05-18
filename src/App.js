import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';

function App() {
    const isLoggedIn = () => !!localStorage.getItem('token');

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contacts" element={isLoggedIn() ? <Contacts /> : <Navigate to="/login" />} />
                <Route path="/profile" element={isLoggedIn() ? <Profile /> : <Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

export default App;