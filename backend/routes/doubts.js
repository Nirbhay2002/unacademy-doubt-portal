const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
    submitDoubt,
    getDoubts,
    deleteDoubt,
    bulkDeleteDoubts
} = require('../controllers/doubtsController');

router.post('/', authMiddleware, submitDoubt);
router.get('/', authMiddleware, getDoubts);
router.delete('/:id', authMiddleware, deleteDoubt);
router.post('/bulk-delete', authMiddleware, bulkDeleteDoubts);

module.exports = router;
