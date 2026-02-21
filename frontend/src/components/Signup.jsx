import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link } from '@mui/material';
import { signup } from '../utils';

const Signup = ({ setView }) => {
    const [rollNumber, setRollNumber] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const result = await signup(rollNumber, password);
        setLoading(false);

        if (result.success) {
            setSuccess('Signup successful! Redirecting to login...');
            setRollNumber('');
            setPassword('');
            setTimeout(() => setView('login'), 1000);
        } else {
            setError(result.error);
        }
    };

    return (
        <Container maxWidth="xs" sx={{ mt: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5" gutterBottom>
                    Sign Up
                </Typography>
                {error && <Typography color="error" variant="body2" sx={{ mb: 2 }}>{error}</Typography>}
                {success && <Typography color="success.main" variant="body2" sx={{ mb: 2 }}>{success}</Typography>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Roll Number"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value)}
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? 'Signing up...' : 'Sign Up'}
                    </Button>
                    <Box sx={{ textAlign: 'center' }}>
                        <Link href="#" variant="body2" onClick={(e) => { e.preventDefault(); setView('login'); }}>
                            {"Already have an account? Sign In"}
                        </Link>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default Signup;
