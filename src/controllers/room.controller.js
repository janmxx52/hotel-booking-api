const prisma = require('../prisma.config');

/* =========================
   ROOM TYPE (LOẠI PHÒNG)
========================= */

// Admin: tạo loại phòng
async function createRoomType(req, res, next) {
  try {
    const { name, description, basePrice } = req.body;

    if (!name || !basePrice) {
      return res.status(400).json({
        message: 'name và basePrice là bắt buộc'
      });
    }

    const roomType = await prisma.roomType.create({
      data: {
        name,
        description,
        basePrice
      }
    });

    res.status(201).json(roomType);
  } catch (err) {
    next(err);
  }
}

// GET tất cả loại phòng
async function getRoomTypes(req, res, next) {
  try {
    const roomTypes = await prisma.roomType.findMany();
    res.json(roomTypes);
  } catch (err) {
    next(err);
  }
}

/* =========================
   ROOM (PHÒNG)
========================= */

// Admin: tạo phòng
async function createRoom(req, res, next) {
  try {
    const { roomNumber, capacity, roomTypeId } = req.body;

    if (!roomNumber || !capacity || !roomTypeId) {
      return res.status(400).json({
        message: 'roomNumber, capacity, roomTypeId là bắt buộc'
      });
    }

    // kiểm tra roomType tồn tại
    const roomType = await prisma.roomType.findUnique({
      where: { id: Number(roomTypeId) }
    });

    if (!roomType) {
      return res.status(400).json({
        message: 'Loại phòng không tồn tại'
      });
    }

    const room = await prisma.room.create({
      data: {
        roomNumber,
        capacity: Number(capacity),
        roomTypeId: Number(roomTypeId)
      }
    });

    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
}

// GET phòng trống
async function getAvailableRooms(req, res, next) {
  try {
    const { checkIn, checkOut, roomTypeId } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({
        message: 'checkIn và checkOut là bắt buộc'
      });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        message: 'checkOut phải lớn hơn checkIn'
      });
    }

    const whereClause = {
      isActive: true,
      status: 'AVAILABLE',
      bookings: {
        none: {
          status: { not: 'CANCELLED' },
          AND: [
            { checkOut: { gt: checkInDate } },
            { checkIn: { lt: checkOutDate } }
          ]
        }
      }
    };

    if (roomTypeId) {
      whereClause.roomTypeId = Number(roomTypeId);
    }

    const rooms = await prisma.room.findMany({
      where: whereClause,
      include: { roomType: true }
    });

    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

// ADMIN: lấy tất cả phòng
async function getAllRooms(req, res, next) {
  try {
    const rooms = await prisma.room.findMany({
      where: { isActive: true },
      include: { roomType: true }
    });
    res.json(rooms);
  } catch (err) {
    next(err);
  }
}

// ADMIN: cập nhật phòng
async function updateRoom(req, res, next) {
  try {
    const id = Number(req.params.id);
    const { roomNumber, capacity, roomTypeId, status } = req.body;

    const room = await prisma.room.update({
      where: { id },
      data: {
        roomNumber,
        capacity: Number(capacity),
        roomTypeId: Number(roomTypeId),
        status
      }
    });

    res.json(room);
  } catch (err) {
    next(err);
  }
}

// ADMIN: ngừng sử dụng phòng (soft delete)
async function disableRoom(req, res, next) {
  try {
    const id = Number(req.params.id);

    await prisma.room.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({ message: 'Phòng đã được ngừng sử dụng' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  /* room type */
  createRoomType,
  getRoomTypes,

  /* room */
  createRoom,
  getAvailableRooms,
  getAllRooms,
  updateRoom,
  disableRoom
};
