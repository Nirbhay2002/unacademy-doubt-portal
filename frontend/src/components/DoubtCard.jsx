import React from 'react';
import { downloadImage } from '../utils';

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:5000';

const DoubtCard = ({ doubt, onZoom }) => {
    return (
        <div className="doubt-card">
            <div className="img-container" onClick={() => onZoom(`${SERVER_BASE}${doubt.imagePath}`)}>
                <img src={`${SERVER_BASE}${doubt.imagePath}`} alt="Doubt" />
                <div className="img-overlay">Click to view</div>
            </div>
            <div className="doubt-info">
                <h3>{doubt.subject}</h3>
                <p>By {doubt.studentName}</p>
                <div className="card-actions">
                    <p style={{ fontSize: '0.75rem' }}>
                        {new Date(doubt.createdAt).toLocaleString()}
                    </p>
                    <button
                        className="download-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            downloadImage(doubt.imagePath, `${doubt.studentName}-${doubt.subject}.jpg`);
                        }}
                    >
                        Download
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoubtCard;
