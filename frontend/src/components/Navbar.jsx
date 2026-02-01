import React from 'react';
import { AppBar, Toolbar, Typography, Tabs, Tab, Container, Box } from '@mui/material';

const Navbar = ({ view, setView }) => {
    const handleTabChange = (event, newValue) => {
        setView(newValue);
    };

    return (
        <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid #e0e0e0', backgroundColor: '#fff', color: '#000' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                        <img src="../assets/img/logo.png" alt="Logo" style={{ height: '40px', marginRight: '12px' }} />
                        <Typography
                            variant="h6"
                            noWrap
                            component="div"
                            sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                            DoubtPortal
                        </Typography>
                    </Box>
                    <Box>
                        <Tabs value={view} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                            <Tab label="Student View" value="student" sx={{ fontWeight: 600 }} />
                            <Tab label="Admin Dashboard" value="admin" sx={{ fontWeight: 600 }} />
                        </Tabs>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Navbar;
