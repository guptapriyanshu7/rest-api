import jwt from "jsonwebtoken";

export default (req, res, next) => {
  const authHeader = req.get("Authorization");
  try {
    if (!authHeader) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, "somesupersecretsecret");
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    next(error);
  }
};
