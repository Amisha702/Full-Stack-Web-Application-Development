const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const ctrl = require('../controllers/productController');

router.get('/', auth, ctrl.getAll);
router.get('/:id', auth, ctrl.getOne);

router.post('/', auth, upload.single('image'), ctrl.create);
router.put('/:id', auth, upload.single('image'), ctrl.update);
router.delete('/:id', auth, ctrl.remove);

module.exports = router;