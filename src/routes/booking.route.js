const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// User: tạo booking, xem booking của mình, hủy booking của mình
router.post('/', authMiddleware, bookingController.createBooking);
router.get('/my', authMiddleware, bookingController.getMyBookings);
router.patch('/:id/cancel', authMiddleware, bookingController.cancelBooking);

// Admin: xem tất cả booking
router.get(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  bookingController.getAllBookings
);

module.exports = router;
