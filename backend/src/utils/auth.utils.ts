import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
type User = {
  _id: string;
  username: string;
  email: string;
};
const generateAccessToken = async (user: User) => {
  const accessToken = jwt.sign(
    {
      userId: user._id,
      username: user.username,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: '30min' },
  );

  return { accessToken };
};
export default generateAccessToken;
