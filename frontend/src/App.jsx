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
        if (token && rollNumber) {
            setIsAuthenticated(true);
            setUser({ rollNumber });
            setView('student');
        }
    }, []);

    const handleLoginSuccess = (token, rollNumber) => {
        localStorage.setItem('token', token);
        localStorage.setItem('rollNumber', rollNumber);
        setIsAuthenticated(true);
        setUser({ rollNumber });
        setView('student'); // Redirect to portal after login
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('rollNumber');
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
                return <StudentView />;
            case 'admin':
                return <AdminDashboard onZoom={setSelectedImg} />;
            default:
                return <StudentView />;
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
