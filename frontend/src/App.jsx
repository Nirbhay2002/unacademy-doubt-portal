import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import ImageModal from './components/ImageModal';

import { Box } from '@mui/material';

function App() {
    const [view, setView] = useState('student');
    const [selectedImg, setSelectedImg] = useState(null);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
            <Navbar view={view} setView={setView} />

            <Box component="main">
                {view === 'student' ? (
                    <StudentView />
                ) : (
                    <AdminDashboard
                        onZoom={setSelectedImg}
                    />
                )}
            </Box>

            <ImageModal
                imageUrl={selectedImg}
                onClose={() => setSelectedImg(null)}
            />
        </Box>
    );
}

export default App;
