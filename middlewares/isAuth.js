import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('Not Authenticated.');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = jwt.verify(token, 'somesupersecretsecret');
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    throw error;
  }
};
