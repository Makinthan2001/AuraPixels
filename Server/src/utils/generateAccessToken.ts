import jwt from 'jsonwebtoken';

export const generateAccessToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: '15m',
  });
};
