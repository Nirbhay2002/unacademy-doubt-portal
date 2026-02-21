import React from 'react';
import {
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Typography,
    Button,
    Box,
    IconButton,
    Tooltip
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import { downloadImage } from '../utils';

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:5000';

const DoubtCard = ({ doubt, onZoom }) => {
    return (
        <Card elevation={0} variant="outlined" sx={{ height: '100%', width: '100%', maxWidth: '400px', mx: 'auto', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}>
            <Box sx={{ position: 'relative', pt: '60%', cursor: 'pointer', backgroundColor: '#f0f2f5' }} onClick={() => onZoom(`${SERVER_BASE}${doubt.imagePath}`)}>
                <CardMedia
                    component="img"
                    image={`${SERVER_BASE}${doubt.imagePath}`}
                    alt="Doubt Image"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                    }}
                />
                <Box className="img-overlay"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        '&:hover': { opacity: 1 },
                        color: '#fff'
                    }}>
                    <ZoomInIcon sx={{ fontSize: 40 }} />
                </Box>
            </Box>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 600 }}>
                    {doubt.subject}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    By {doubt.studentName}
                </Typography>
                <Typography variant="caption" display="block" color="text.disabled" sx={{ mt: 1 }}>
                    {new Date(doubt.createdAt).toLocaleString()}
                </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <Button
                    variant="contained"
                    disableElevation
                    size="small"
                    startIcon={<DownloadIcon />}
                    onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(doubt.imagePath, `${doubt.studentName}-${doubt.subject}.jpg`);
                    }}
                >
                    Download
                </Button>
            </CardActions>
        </Card>
    );
};

export default DoubtCard;
