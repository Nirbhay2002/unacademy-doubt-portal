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
    Tooltip,
    Checkbox
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import { downloadImage } from '../utils';

const SERVER_BASE = import.meta.env.VITE_SERVER_BASE || 'http://localhost:5000';

const DoubtCard = ({ doubt, onZoom, onDelete, onSelect, isSelected }) => {
    return (
        <Card elevation={0} variant="outlined" sx={{ position: 'relative', height: '100%', width: '100%', maxWidth: '400px', mx: 'auto', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }, border: isSelected ? '2px solid #1976d2' : '1px solid rgba(0, 0, 0, 0.12)' }}>
            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '4px' }}>
                <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelect(doubt._id, e.target.checked)}
                    color="primary"
                />
            </Box>
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
            <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Tooltip title="Delete Doubt">
                    <IconButton color="error" onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this doubt?')) {
                            onDelete(doubt._id);
                        }
                    }}>
                        <DeleteIcon />
                    </IconButton>
                </Tooltip>
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
