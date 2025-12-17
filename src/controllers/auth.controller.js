const prisma = require('../prisma.config');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

async function register(req, res, next) {
  try {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: 'fullName, email, password là bắt buộc' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }

    const hashed = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        password: hashed,
        phone,
        role: 'USER',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'email, password là bắt buộc' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: 'Sai email hoặc password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: 'Sai email hoặc password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
};
