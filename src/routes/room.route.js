const express = require('express');
const router = express.Router();

const roomController = require('../controllers/room.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// SEARCH phòng trống (PUBLIC)
router.get('/available', roomController.getAvailableRooms);

// ADMIN - ROOM
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  roomController.getAllRooms
);

router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  roomController.createRoom
);

router.put(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  roomController.updateRoom
);

router.patch(
  '/:id/disable',
  authMiddleware,
  roleMiddleware('ADMIN'),
  roomController.disableRoom
);

// ROOM TYPE
router.post(
  '/types',
  authMiddleware,
  roleMiddleware('ADMIN'),
  roomController.createRoomType
);



router.get('/types', roomController.getRoomTypes);

module.exports = router;
