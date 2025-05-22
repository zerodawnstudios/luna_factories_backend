import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../prisma/client.js';

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
};

// Register a new user
const register = async (req, res) => {
  const { name, email, password, phone, country } = req.body;

  if (!name || !email || !password || !phone || !country) {
    return res.status(400).json({ message: 'Please provide all fields' });
  }

  try {
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        country,
      },
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.SECRET_KEY,
      { expiresIn: '1h' }
    );

    // Set token as cookie
    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        country: newUser.country,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login a user
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: 'Please provide email and password' });
  }

  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare the password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Set token as cookie
    res.cookie('token', token, cookieOptions);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout a user
const logout = async (req, res) => {
  // Clear the cookie
  res.clearCookie('token');

  res.json({ message: 'Logged out successfully' });
};

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    // User already attached by middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export default { register, login, logout, getCurrentUser };
