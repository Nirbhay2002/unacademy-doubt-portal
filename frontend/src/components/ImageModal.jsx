import React from 'react';
import { Dialog, DialogContent, IconButton, Box } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageModal = ({ imageUrl, onClose }) => {
    return (
        <Dialog
            open={!!imageUrl}
            onClose={onClose}
            maxWidth="lg"
            PaperProps={{
                sx: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    overflow: 'visible'
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: { xs: 10, sm: -40 },
                        top: { xs: 10, sm: -40 },
                        color: { xs: '#000', sm: '#fff' },
                        backgroundColor: { xs: 'rgba(255,255,255,0.7)', sm: 'transparent' },
                        '&:hover': { backgroundColor: { xs: 'rgba(255,255,255,0.9)', sm: 'rgba(255,255,255,0.1)' } },
                        zIndex: 1
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent sx={{ p: 0 }}>
                    <img
                        src={imageUrl}
                        alt="Zoomed Doubt"
                        style={{
                            maxWidth: '100%',
                            maxHeight: '90vh',
                            borderRadius: '8px',
                            display: 'block'
                        }}
                    />
                </DialogContent>
            </Box>
        </Dialog>
    );
};

export default ImageModal;
