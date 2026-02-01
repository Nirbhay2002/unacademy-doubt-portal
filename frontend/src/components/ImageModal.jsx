import React from 'react';

const ImageModal = ({ imageUrl, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <span className="close" onClick={onClose}>&times;</span>
                <img src={imageUrl} alt="Zoomed Doubt" />
            </div>
        </div>
    );
};

export default ImageModal;
