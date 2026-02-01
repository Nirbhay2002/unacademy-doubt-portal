const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:5000';

export const fetchDoubts = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE}/doubts${queryParams ? `?${queryParams}` : ''}`);
        return await response.json();
    } catch (err) {
        console.error('Error fetching doubts:', err);
        return [];
    }
};

export const submitDoubt = async (formData, file) => {
    const data = new FormData();
    data.append('studentName', formData.studentName);
    data.append('school', formData.school);
    data.append('subject', formData.subject);
    data.append('image', file);

    try {
        const response = await fetch(`${API_BASE}/doubts`, {
            method: 'POST',
            body: data,
        });
        return response.ok;
    } catch (err) {
        console.error('Error submitting doubt:', err);
        return false;
    }
};

export const downloadImage = async (imagePath, fileName) => {
    try {
        const response = await fetch(`${SERVER_BASE}${imagePath}`);
        const blobData = await response.blob();
        const url = window.URL.createObjectURL(blobData);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'doubt-image.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (err) {
        console.error('Download failed:', err);
        window.open(`${SERVER_BASE}${imagePath}`, '_blank');
    }
};
