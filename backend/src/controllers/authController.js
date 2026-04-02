import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import prisma from '../config/prisma.js';


// Environment variables you'll need to set
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';
const RESET_TOKEN_EXPIRE = 3600000; // 1 hour in milliseconds

const ensureProfessionalProfile = async (userId, fallbackSkill = 'General Professional') => {
  const existing = await prisma.professional.findUnique({
    where: { userId },
    select: { professionalId: true },
  });

  if (!existing) {
    await prisma.professional.create({
      data: {
        userId,
        skill: fallbackSkill,
        experienceYears: 0,
        hourlyRate: null,
        bio: null,
        isAvailable: true,
      },
    });
  }
};

// Register new user
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, role, skill, experienceYears, hourlyRate, bio } = req.body;
    const normalizedRole = role === 'professional' ? 'professional' : 'user';

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    if (normalizedRole === 'professional' && !skill) {
      return res.status(400).json({
        success: false,
        message: 'Skill is required for professional registration'
      });
    }

    const parsedExperienceYears = experienceYears != null && experienceYears !== '' ? parseInt(experienceYears, 10) : 0;
    const parsedHourlyRate = hourlyRate != null && hourlyRate !== '' ? parseFloat(hourlyRate) : null;

    if (Number.isNaN(parsedExperienceYears) || parsedExperienceYears < 0) {
      return res.status(400).json({
        success: false,
        message: 'Experience years must be a non-negative number'
      });
    }

    if (parsedHourlyRate != null && (Number.isNaN(parsedHourlyRate) || parsedHourlyRate < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Hourly rate must be a non-negative number'
      });
    }

    console.log('Registration attempt for:', email);

    // Check if user already exists (PRISMA WAY)
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log('Email already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user (PRISMA WAY)
    console.log('Creating user in database...');
    const user = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: normalizedRole
        }
      });

      if (normalizedRole === 'professional') {
        await tx.professional.create({
          data: {
            userId: createdUser.id,
            skill,
            experienceYears: parsedExperienceYears,
            hourlyRate: parsedHourlyRate,
            bio: bio || null,
            isAvailable: true,
          }
        });
      }

      return createdUser;
    });

    if (normalizedRole === 'professional') {
      await ensureProfessionalProfile(user.id, skill);
    }

    console.log('✅ User created:', user.id, user.email);

    // Create JWT token
    if (user.role === 'professional') {
      await ensureProfessionalProfile(user.id);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    console.log('JWT token generated');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};


// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    // Create session (optional - for session-based auth)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const sessionExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Delete old sessions for this user first
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    // Create new session
    await prisma.session.create({
      data: {
        userId: user.id,
        sessionToken,
        expiresAt: sessionExpiry
      }
    });

    // Set session cookie
    res.cookie('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware

    // Delete session from database
    await prisma.session.deleteMany({
      where: { userId }
    });
    
    // Clear session cookie
    res.clearCookie('session_token');

    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


// ???????????????????????????????????

// Request password reset
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email'
      });
    }

    // Check if user exists

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If email exists, password reset link has been sent'
      });
    }


    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpire = new Date(Date.now() + RESET_TOKEN_EXPIRE);

    // Save reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpire: resetExpire
      }
    });

    console.log('Password reset token:', resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken: resetToken
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Reset password with token
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide new password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }


    // Hash the token from URL
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token

    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpire: {
          gt: new Date()
        }
      },
      select: { id: true }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpire: null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword
      }
    });

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
