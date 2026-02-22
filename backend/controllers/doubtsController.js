const Doubt = require('../models/Doubt');
const { cloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const { getUserName } = require('../users');
const { logError } = require('../utils/logger');

// POST /api/doubts
const submitDoubt = async (req, res) => {
    try {
        // express-fileupload populates req.files
        if (!req.files || !req.files.image) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        const imageFile = req.files.image;
        console.log('Image received:', imageFile.name, imageFile.mimetype, imageFile.size, 'bytes');

        // Upload to Cloudinary via base64 data URI — no streams
        const dataUri = `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}`;
        console.log('Uploading to Cloudinary...');

        const cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'student-doubts',
            resource_type: 'auto'
        });
        console.log('Cloudinary upload success:', cloudinaryResult.secure_url);

        const { school, subject } = req.body;
        const studentName = req.user.name || getUserName(req.user.rollNumber);

        const doubt = new Doubt({
            studentName,
            school,
            subject,
            imagePath: cloudinaryResult.secure_url
        });
        await doubt.save();
        console.log('Doubt saved to DB:', doubt._id);

        res.status(201).json({ message: 'Doubt uploaded successfully', doubt });
    } catch (err) {
        logError('submitDoubt error:', err);
        res.status(500).json({ error: err.message });
    }
};

// GET /api/doubts
const getDoubts = async (req, res) => {
    try {
        const { school, subject } = req.query;
        const query = {};
        if (school) query.school = school;
        if (subject) query.subject = subject;

        const doubts = await Doubt.find(query).sort({ createdAt: -1 });
        res.json(doubts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/doubts/:id
const deleteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ error: 'Doubt not found' });

        if (doubt.imagePath) await deleteFromCloudinary(doubt.imagePath);
        await Doubt.findByIdAndDelete(req.params.id);
        res.json({ message: 'Doubt deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/doubts/bulk-delete
const bulkDeleteDoubts = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Invalid or empty array of IDs provided.' });
        }

        const doubtsToDelete = await Doubt.find({ _id: { $in: ids } });
        for (const doubt of doubtsToDelete) {
            if (doubt.imagePath) await deleteFromCloudinary(doubt.imagePath);
        }

        const result = await Doubt.deleteMany({ _id: { $in: ids } });
        res.json({ message: `Successfully deleted ${result.deletedCount} doubts` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { submitDoubt, getDoubts, deleteDoubt, bulkDeleteDoubts };
