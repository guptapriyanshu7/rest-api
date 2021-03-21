import { body } from "express-validator";

import authController from "../controllers/auth.js";
import isAuth from "../middlewares/isAuth.js";

export default (router) => {
  router.post(
    "/signup",
    [
      body("email")
        .isEmail()
        .withMessage("Please enter a valid email.")
        .normalizeEmail(),
      body("password").trim().isLength({ min: 5 }),
      body("name").trim().notEmpty(),
    ],
    authController.signup
  );

  router.post("/verify", authController.generateVerifyMail);

  router.get("/verify/:token", authController.verifyUser);

  router.post("/login", authController.login);

  router.post("/reset", authController.generatResetToken);

  router.get("/reset/:token", authController.verifyResetToken);

  router.post("/change-password", authController.resetPassword);

  router
    .route("/status")
    .get(isAuth, authController.getUserStatus)
    .patch(
      isAuth,
      body("status").trim().notEmpty(),
      authController.updateUserStatus
    );

  return router;
};
