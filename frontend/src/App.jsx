import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import ImageModal from './components/ImageModal';
import Login from './components/Login';
import Signup from './components/Signup';

import { Box } from '@mui/material';

function App() {
    const [view, setView] = useState('login'); // Default to login
    const [selectedImg, setSelectedImg] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const rollNumber = localStorage.getItem('rollNumber');
        const role = localStorage.getItem('role');
        if (token && rollNumber && role) {
            setIsAuthenticated(true);
            setUser({ rollNumber, role });
            // Set initial view based on role
            if (role === 'student') setView('student');
            else if (role === 'teacher' || role === 'admin') setView('admin');
        }
    }, []);

    const handleLoginSuccess = (token, rollNumber, name, role) => {
        localStorage.setItem('token', token);
        localStorage.setItem('rollNumber', rollNumber);
        localStorage.setItem('role', role);
        setIsAuthenticated(true);
        setUser({ rollNumber, name, role });

        // Redirect based on role
        if (role === 'student') setView('student');
        else if (role === 'teacher' || role === 'admin') setView('admin');
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rollNumber');
        localStorage.removeItem('role');
        setIsAuthenticated(false);
        setUser(null);
        setView('login');
    };

    const renderView = () => {
        if (!isAuthenticated) {
            if (view === 'signup') {
                return <Signup setView={setView} />;
            }
            return <Login setView={setView} onLoginSuccess={handleLoginSuccess} />;
        }

        switch (view) {
            case 'student':
                return user?.role === 'student' || user?.role === 'admin' ? <StudentView /> : setView('admin');
            case 'admin':
                return user?.role === 'teacher' || user?.role === 'admin' ? <AdminDashboard onZoom={setSelectedImg} /> : setView('student');
            default:
                return user?.role === 'student' ? <StudentView /> : <AdminDashboard onZoom={setSelectedImg} />;
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar view={view} setView={setView} isAuthenticated={isAuthenticated} onLogout={handleLogout} user={user} />

            <Box component="main">
                {renderView()}
            </Box>

            <ImageModal
                imageUrl={selectedImg}
                onClose={() => setSelectedImg(null)}
            />
        </Box>
    );
}

export default App;
