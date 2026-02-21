import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Box,
    CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
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
        <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper elevation={0} variant="outlined" sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom sx={{ mb: { xs: 3, sm: 4 }, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                    <span style={{ color: '#1976d2' }}>Got a</span> <span style={{ color: '#00c07aff' }}>Question?</span>
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField
                            fullWidth
                            label="Your Name"
                            value={formData.studentName}
                            onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel>School</InputLabel>
                            <Select
                                value={formData.school}
                                label="School"
                                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                            >
                                <option value="" hidden />
                                {SCHOOLS.map(school => (
                                    <MenuItem key={school} value={school}>{school}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth required>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={formData.subject}
                                label="Subject"
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            >
                                <option value="" hidden />
                                {SUBJECTS.map(subject => (
                                    <MenuItem key={subject} value={subject}>{subject}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<CloudUploadIcon />}
                            sx={{ py: 1.5 }}
                        >
                            {file ? file.name : 'Upload Doubt Image'}
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mt: 2, py: 1.5 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Doubt'}
                        </Button>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default StudentView;
