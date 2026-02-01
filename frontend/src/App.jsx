import React, { useState } from 'react';
import Navbar from './components/Navbar';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import ImageModal from './components/ImageModal';

function App() {
    const [view, setView] = useState('student');
    const [selectedImg, setSelectedImg] = useState(null);

    return (
        <div className="container">
            <Navbar view={view} setView={setView} />

            <main>
                {view === 'student' ? (
                    <StudentView />
                ) : (
                    <AdminDashboard
                        onZoom={setSelectedImg}
                    />
                )}
            </main>

            <ImageModal
                imageUrl={selectedImg}
                onClose={() => setSelectedImg(null)}
            />
        </div>
    );
}

export default App;
