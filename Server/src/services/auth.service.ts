import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma';
import { generateOTP } from '../utils/generateOTP';
import { emailService } from './email.service';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

export const authService = {
  initiateRegister: async (email: string) => {
    // Check if verified user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && existingUser.verified) {
      throw new Error('User already exists and is verified');
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store or update OTP
    await prisma.otp.create({
      data: {
        email,
        code: otp,
        expiresAt,
      },
    });

    await emailService.sendOTP(email, otp);
    return { message: 'OTP sent successfully' };
  },

  verifyOTPAndCreateUser: async (name: string, email: string, password: string, otp: string) => {
    // Find the latest valid OTP for this email
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        code: otp,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new Error('Invalid or expired OTP');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        password: hashedPassword,
        verified: true,
      },
      create: {
        name,
        email,
        password: hashedPassword,
        verified: true,
      },
    });

    // Delete all OTPs for this email after success
    await prisma.otp.deleteMany({ where: { email } });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  login: async (email: string, pass: string) => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.verified) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt,
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },

  refresh: async (token: string) => {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      if (storedToken) await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new Error('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(storedToken.userId);
    const { password: _, ...userWithoutPassword } = storedToken.user;
    
    return { user: userWithoutPassword, accessToken: newAccessToken };
  },

  logout: async (token: string) => {
    await prisma.refreshToken.deleteMany({ where: { token } });
  },
};
