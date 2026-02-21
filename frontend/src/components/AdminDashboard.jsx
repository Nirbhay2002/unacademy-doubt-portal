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
    CircularProgress,
    Button,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DoubtCard from './DoubtCard';
import { fetchDoubts, deleteDoubt, bulkDeleteDoubts } from '../utils';

const SCHOOLS = ['Unacademy, Chandigarh'];

const AdminDashboard = ({ onZoom }) => {
    const [doubts, setDoubts] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [availableSubjects, setAvailableSubjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDoubts, setSelectedDoubts] = useState([]);

    useEffect(() => {
        if (selectedSchool) {
            loadAvailableSubjects();
            setSelectedSubject('');
            setDoubts([]);
            setSelectedDoubts([]);
        } else {
            setAvailableSubjects([]);
            setDoubts([]);
            setSelectedDoubts([]);
        }
    }, [selectedSchool]);

    useEffect(() => {
        if (selectedSchool && selectedSubject) {
            loadFilteredDoubts();
            setSelectedDoubts([]);
        } else {
            setDoubts([]);
            setSelectedDoubts([]);
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
        setSelectedDoubts([]);
        setLoading(false);
    };

    const handleDelete = async (id) => {
        const success = await deleteDoubt(id);
        if (success) {
            loadFilteredDoubts();
        } else {
            alert('Failed to delete doubt.');
        }
    };

    const handleSelect = (id, isSelected) => {
        if (isSelected) {
            setSelectedDoubts(prev => [...prev, id]);
        } else {
            setSelectedDoubts(prev => prev.filter(doubtId => doubtId !== id));
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedDoubts(doubts.map(d => d._id));
        } else {
            setSelectedDoubts([]);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedDoubts.length} doubts?`)) {
            setLoading(true);
            const success = await bulkDeleteDoubts(selectedDoubts);
            if (success) {
                loadFilteredDoubts();
            } else {
                alert('Failed to delete selected doubts.');
                setLoading(false);
            }
        }
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
                    <>
                        {doubts.length > 0 && (
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 1 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={selectedDoubts.length === doubts.length && doubts.length > 0}
                                            indeterminate={selectedDoubts.length > 0 && selectedDoubts.length < doubts.length}
                                            onChange={handleSelectAll}
                                            color="primary"
                                        />
                                    }
                                    label="Select All"
                                />
                                {selectedDoubts.length > 0 && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        startIcon={<DeleteIcon />}
                                        onClick={handleBulkDelete}
                                    >
                                        Delete Selected ({selectedDoubts.length})
                                    </Button>
                                )}
                            </Box>
                        )}
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
                                            onDelete={handleDelete}
                                            onSelect={handleSelect}
                                            isSelected={selectedDoubts.includes(doubt._id)}
                                        />
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </>
                )}
            </Box>
        </Container>
    );
};

export default AdminDashboard;
