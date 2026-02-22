const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    try {
        // Extract public_id from the secure URL
        // URL format: https://res.cloudinary.com/<cloud>/image/upload/v<ver>/student-doubts/<id>.ext
        const urlParts = imageUrl.split('/');
        const fileWithExt = urlParts[urlParts.length - 1];
        const publicId = `student-doubts/${fileWithExt.split('.')[0]}`;
        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.error('Error deleting from Cloudinary:', err.message);
    }
};

module.exports = { cloudinary, deleteFromCloudinary };
