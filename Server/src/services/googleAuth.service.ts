import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../lib/prisma';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error('GOOGLE_CLIENT_ID is not defined in environment variables');
  process.exit(1);
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ─── Types ───────────────────────────────────────────────────────────────────

interface GooglePayload {
  email: string;
  name: string;
  picture?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const googleAuthService = {
  /**
   * Verifies the Google ID Token received from the mobile client.
   * Never trust the frontend — always verify server-side.
   */
  verifyGoogleToken: async (idToken: string): Promise<GooglePayload> => {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token: empty payload');
    }

    if (!payload.email || !payload.name) {
      throw new Error('Invalid Google token: missing required fields');
    }

    if (!payload.email_verified) {
      throw new Error('Google account email is not verified');
    }

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  },

  /**
   * Handles the full Google Sign-In flow:
   * 1. Verify the ID token
   * 2. Find or create the user
   * 3. Issue access + refresh tokens
   */
  googleSignIn: async (idToken: string) => {
    // Step 1 — Verify token with Google
    const { email, name, picture } = await googleAuthService.verifyGoogleToken(idToken);

    // Step 2 — Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      // Existing user — update profile picture if it changed
      if (user.provider !== 'google') {
        // Account was created with email/password — link it to Google but keep password
        user = await prisma.user.update({
          where: { email },
          data: {
            profileImage: picture ?? user.profileImage,
            verified: true,
          },
        });
      } else {
        // Pure Google user — refresh profile picture
        user = await prisma.user.update({
          where: { email },
          data: { profileImage: picture ?? user.profileImage },
        });
      }
    } else {
      // New user — create account with no password
      user = await prisma.user.create({
        data: {
          name,
          email,
          password: null,
          provider: 'google',
          profileImage: picture ?? null,
          verified: true,
        },
      });
    }

    // Step 3 — Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: refreshExpiresAt,
      },
    });

    // Never return sensitive fields
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  },
};
