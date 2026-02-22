const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:5000';

export const fetchDoubts = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/doubts${queryParams ? `?${queryParams}` : ''}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/doubts`, {
            method: 'POST',
            body: data,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (err) {
        console.error('Error submitting doubt:', err);
        return false;
    }
};

export const downloadImage = async (imagePath, fileName) => {
    try {
        const response = await fetch(imagePath);
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
        window.open(imagePath, '_blank');
    }
};

export const signup = async (rollNumber, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber, password }),
        });
        const data = await response.json();
        if (response.ok) return { success: true, data };
        return { success: false, error: data.error };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const login = async (rollNumber, password) => {
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber, password }),
        });
        const data = await response.json();
        if (response.ok) return { success: true, data };
        return { success: false, error: data.error };
    } catch (err) {
        return { success: false, error: err.message };
    }
};

export const deleteDoubt = async (id) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/doubts/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok;
    } catch (err) {
        console.error('Error deleting doubt:', err);
        return false;
    }
};

export const bulkDeleteDoubts = async (ids) => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE}/doubts/bulk-delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ ids })
        });
        return response.ok;
    } catch (err) {
        console.error('Error bulk deleting doubts:', err);
        return false;
    }
};
