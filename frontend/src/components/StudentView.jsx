import React, { useState } from 'react';
import { submitDoubt } from '../utils';

const StudentView = () => {
    const [formData, setFormData] = useState({ studentName: '', subject: '' });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return alert('Please upload an image');

        setLoading(true);
        const success = await submitDoubt(formData, file);
        setLoading(false);

        if (success) {
            alert('Doubt submitted successfully!');
            setFormData({ studentName: '', subject: '' });
            setFile(null);
            e.target.reset();
        } else {
            alert('Error submitting doubt. Please try again.');
        }
    };

    return (
        <div className="card">
            <h2>Ask a Doubt</h2>
            <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
                <div className="form-group">
                    <label>Your Name</label>
                    <input
                        type="text"
                        value={formData.studentName}
                        onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                        placeholder="Enter name"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Subject</label>
                    <input
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="e.g. Mathematics"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Doubt Image</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Uploading...' : 'Submit Doubt'}
                </button>
            </form>
        </div>
    );
};

export default StudentView;
