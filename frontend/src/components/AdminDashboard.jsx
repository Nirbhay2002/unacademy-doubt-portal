import React, { useState, useEffect } from 'react';
import DoubtCard from './DoubtCard';
import { fetchDoubts } from '../utils';

const SCHOOLS = ['School A', 'School B', 'School C'];

const AdminDashboard = ({ onZoom }) => {
    const [doubts, setDoubts] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch unique subjects for the selected school
    useEffect(() => {
        if (selectedSchool) {
            loadAvailableSubjects();
            setSelectedSubject(''); // Reset subject when school changes
            setDoubts([]); // Clear doubts when school changes
        } else {
            setAvailableSubjects([]);
            setDoubts([]);
        }
    }, [selectedSchool]);

    // Fetch doubts when both are selected
    useEffect(() => {
        if (selectedSchool && selectedSubject) {
            loadFilteredDoubts();
        } else {
            setDoubts([]);
        }
    }, [selectedSchool, selectedSubject]);

    const loadAvailableSubjects = async () => {
        // We can fetch all doubts for the school to find unique subjects
        const data = await fetchDoubts({ school: selectedSchool });
        const subjects = [...new Set(data.map(d => d.subject))];
        setAvailableSubjects(subjects);
    };

    const loadFilteredDoubts = async () => {
        setLoading(true);
        const data = await fetchDoubts({ school: selectedSchool, subject: selectedSubject });
        setDoubts(data);
        setLoading(false);
    };

    return (
        <div className="admin-container">
            <div className="filter-bar card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                <h3>Filter Doubts</h3>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                        <label>Select School</label>
                        <select
                            value={selectedSchool}
                            onChange={(e) => setSelectedSchool(e.target.value)}
                        >
                            <option value="">-- Select School --</option>
                            {SCHOOLS.map(school => (
                                <option key={school} value={school}>{school}</option>
                            ))}
                        </select>
                    </div>

                    {selectedSchool && (
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label>Select Subject</label>
                            <select
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                            >
                                <option value="">-- Select Subject --</option>
                                {availableSubjects.length > 0 ? (
                                    availableSubjects.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))
                                ) : (
                                    <option disabled>No doubts found for this school</option>
                                )}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            <main>
                {(!selectedSchool || !selectedSubject) ? (
                    <div className="empty-state">
                        <p>Please select a school and a subject to view doubt images.</p>
                    </div>
                ) : loading ? (
                    <div className="empty-state">
                        <p>Loading doubts...</p>
                    </div>
                ) : (
                    <div className="doubts-grid">
                        {doubts.length === 0 ? (
                            <div className="empty-state">
                                <p>No doubts found for the selected filters.</p>
                            </div>
                        ) : (
                            doubts.map((doubt) => (
                                <DoubtCard
                                    key={doubt._id}
                                    doubt={doubt}
                                    onZoom={onZoom}
                                />
                            ))
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
