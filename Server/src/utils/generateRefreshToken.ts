import jwt from 'jsonwebtoken';

export const generateRefreshToken = (id: number): string => {
  return jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET || (process.env.JWT_SECRET as string + '_refresh'), {
    expiresIn: '7d',
  });
};
