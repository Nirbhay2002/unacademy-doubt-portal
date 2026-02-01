import React, { useState } from 'react';
import { submitDoubt } from '../utils';

const SCHOOLS = ['School A', 'School B', 'School C'];
const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics', 'Chemistry', 'Biology'];

const StudentView = () => {
    const [formData, setFormData] = useState({
        studentName: '',
        school: '',
        subject: ''
    });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.school) return alert('Please select your school');
        if (!file) return alert('Please upload an image');

        setLoading(true);
        const success = await submitDoubt(formData, file);
        setLoading(false);

        if (success) {
            alert('Doubt submitted successfully!');
            setFormData({ studentName: '', school: '', subject: '' });
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
                    <label>School</label>
                    <select
                        value={formData.school}
                        onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                        required
                    >
                        <option value="">Select School</option>
                        {SCHOOLS.map(school => (
                            <option key={school} value={school}>{school}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label>Subject</label>
                    <select
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                    >
                        <option value="">Select Subject</option>
                        {SUBJECTS.map(subject => (
                            <option key={subject} value={subject}>{subject}</option>
                        ))}
                    </select>
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
