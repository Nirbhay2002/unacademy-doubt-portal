import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import StudentView from './components/StudentView';
import AdminDashboard from './components/AdminDashboard';
import ImageModal from './components/ImageModal';
import { fetchDoubts } from './utils';

function App() {
    const [view, setView] = useState('student');
    const [doubts, setDoubts] = useState([]);
    const [selectedImg, setSelectedImg] = useState(null);

    useEffect(() => {
        if (view === 'admin') {
            loadDoubts();
        }
    }, [view]);

    const loadDoubts = async () => {
        const data = await fetchDoubts();
        setDoubts(data);
    };

    return (
        <div className="container">
            <Navbar view={view} setView={setView} />

            <main>
                {view === 'student' ? (
                    <StudentView />
                ) : (
                    <AdminDashboard
                        doubts={doubts}
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
