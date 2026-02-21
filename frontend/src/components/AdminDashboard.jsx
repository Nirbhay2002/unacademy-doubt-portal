import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Paper,
    Box,
    CircularProgress
} from '@mui/material';
import DoubtCard from './DoubtCard';
import { fetchDoubts } from '../utils';

const SCHOOLS = ['Unacademy, Chandigarh'];

const AdminDashboard = ({ onZoom }) => {
    const [doubts, setDoubts] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedSchool) {
            loadAvailableSubjects();
            setSelectedSubject('');
            setDoubts([]);
        } else {
            setAvailableSubjects([]);
            setDoubts([]);
        }
    }, [selectedSchool]);

    useEffect(() => {
        if (selectedSchool && selectedSubject) {
            loadFilteredDoubts();
        } else {
            setDoubts([]);
        }
    }, [selectedSchool, selectedSubject]);

    const loadAvailableSubjects = async () => {
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
        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
            <Paper elevation={0} variant="outlined" sx={{ p: { xs: 2, sm: 4 }, mb: 4 }}>
                <Typography variant="h5"
                    sx={{ fontWeight: 600, mb: 3 }}>
                    Filter Doubts
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <FormControl fullWidth sx={{ minWidth: 250 }}>
                            <InputLabel id="school-select-label">Select School</InputLabel>
                            <Select
                                labelId="school-select-label"
                                value={selectedSchool}
                                label="Select School"
                                onChange={(e) => setSelectedSchool(e.target.value)}
                            >
                                <MenuItem value=""><em>-- Select School --</em></MenuItem>
                                {SCHOOLS.map(school => (
                                    <MenuItem key={school} value={school}>{school}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {selectedSchool && (
                        <Grid item xs={12}>
                            <FormControl fullWidth sx={{ minWidth: 250 }}>
                                <InputLabel>Select Subject</InputLabel>
                                <Select
                                    value={selectedSubject}
                                    label="Select Subject"
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                >
                                    <MenuItem value="">-- Select Subject --</MenuItem>
                                    {availableSubjects.map(sub => (
                                        <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Box sx={{ minHeight: '300px' }}>
                {(!selectedSchool || !selectedSubject) ? (
                    <Paper elevation={0} variant="outlined" sx={{ py: 10, textAlign: 'center', backgroundColor: '#fafafa' }}>
                        <Typography color="text.secondary">
                            Please select a school and a subject to view doubt images.
                        </Typography>
                    </Paper>
                ) : loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Grid container spacing={3} justifyContent="center">
                        {doubts.length === 0 ? (
                            <Grid item xs={12}>
                                <Paper elevation={0} variant="outlined" sx={{ py: 10, textAlign: 'center' }}>
                                    <Typography color="text.secondary">
                                        No doubts found for the selected filters.
                                    </Typography>
                                </Paper>
                            </Grid>
                        ) : (
                            doubts.map((doubt) => (
                                <Grid item xs={12} sm={6} md={4} key={doubt._id} sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                    <DoubtCard
                                        doubt={doubt}
                                        onZoom={onZoom}
                                    />
                                </Grid>
                            ))
                        )}
                    </Grid>
                )}
            </Box>
        </Container>
    );
};

export default AdminDashboard;
