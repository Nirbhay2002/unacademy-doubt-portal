import React from 'react';
import DoubtCard from './DoubtCard';

const AdminDashboard = ({ doubts, onZoom }) => {
    return (
        <div className="doubts-grid">
            {doubts.length === 0 ? (
                <div className="empty-state">
                    <p>No doubts uploaded yet.</p>
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
    );
};

export default AdminDashboard;
