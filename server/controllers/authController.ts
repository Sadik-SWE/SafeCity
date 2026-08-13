import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbStore } from '../db/store';

const JWT_SECRET = process.env.JWT_SECRET || 'safecity_super_secret_jwt_key_2026_university_project';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    const existingUser = await dbStore.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Default role is always CITIZEN on public registration
    const user = await dbStore.createUser({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone || '',
      role: 'CITIZEN',
      isActive: true,
    });

    const token = generateToken(user._id, user.role);

    // Create welcome notification
    await dbStore.createNotification({
      userId: user._id,
      title: 'Welcome to SafeCity AI',
      message: 'Thank you for registering! You can now report community incidents and keep your neighborhood safe.',
      type: 'SYSTEM',
    });

    const userObj = { ...user };
    delete (userObj as any).password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userObj,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server registration error' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await dbStore.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    let isMatch = false;
    // Check hashed password or direct string for seeded accounts
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      isMatch = password === user.password;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id, user.role);
    const userObj = { ...user };
    delete (userObj as any).password;

    // Ensure user data is synced/updated in Supabase users table on login
    dbStore.syncUserToSupabase(user).catch(err => console.warn('Supabase login sync notice:', err));

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userObj,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Server login error' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    const userObj = { ...req.user };
    delete userObj.password;
    res.json({ success: true, user: userObj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    const user = await dbStore.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updates: any = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ success: false, message: 'Current password is required to change password' });
      }

      let isMatch = false;
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        isMatch = await bcrypt.compare(currentPassword, user.password);
      } else {
        isMatch = currentPassword === user.password;
      }

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(newPassword, salt);
    }

    const updatedUser = await dbStore.updateUser(userId, updates);
    if (!updatedUser) {
      return res.status(500).json({ success: false, message: 'Failed to update user profile' });
    }

    const userObj = { ...updatedUser };
    delete userObj.password;

    res.json({ success: true, message: 'Profile updated successfully', user: userObj });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
