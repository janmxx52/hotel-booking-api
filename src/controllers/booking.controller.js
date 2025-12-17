const prisma = require('../prisma.config');

// User: tạo booking
async function createBooking(req, res, next) {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    const userId = req.user.id;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        message: 'roomId, checkIn, checkOut là bắt buộc',
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    if (checkOutDate <= checkInDate) {
      return res
        .status(400)
        .json({ message: 'checkOut phải lớn hơn checkIn' });
    }

    // Kiểm tra phòng tồn tại
    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
      include: { roomType: true },
    });

    if (!room)
      return res.status(404).json({ message: 'Không tìm thấy phòng' });

    if (room.status !== 'AVAILABLE') {
      return res
        .status(400)
        .json({ message: 'Phòng đang bảo trì / không khả dụng' });
    }

    // Kiểm tra trùng lịch
    const conflict = await prisma.booking.findFirst({
      where: {
        roomId: room.id,
        status: { not: 'CANCELLED' },
        AND: [
          { checkOut: { gt: checkInDate } },
          { checkIn: { lt: checkOutDate } },
        ],
      },
    });

    if (conflict) {
      return res
        .status(400)
        .json({ message: 'Phòng đã được đặt trong khoảng thời gian này' });
    }

    // Tính số đêm
    const msPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate - checkInDate) / msPerDay);
    const totalPrice = Number(room.roomType.basePrice) * nights;

    const booking = await prisma.booking.create({
      data: {
        roomId: room.id,
        userId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: 'CONFIRMED',
      },
      include: {
        room: { include: { roomType: true } },
        user: true,
      },
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
}

// User: xem booking của mình
async function getMyBookings(req, res, next) {
  try {
    const userId = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        room: { include: { roomType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

// User/Admin: hủy booking
async function cancelBooking(req, res, next) {
  try {
    const bookingId = Number(req.params.id);
    const user = req.user;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking)
      return res.status(404).json({ message: 'Không tìm thấy booking' });

    if (user.role !== 'ADMIN' && booking.userId !== user.id) {
      return res
        .status(403)
        .json({ message: 'Không có quyền hủy booking này' });
    }

    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
}

// Admin: xem tất cả booking
async function getAllBookings(req, res, next) {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        room: { include: { roomType: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};
