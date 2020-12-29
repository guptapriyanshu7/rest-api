import crypto from "crypto";

import { validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";

import User from "../models/user.js";

sgMail.setApiKey("SENDGRID_API_KEY");

export default {
  signup: async (req, res, next) => {
    const errors = validationResult(req);
    try {
      if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        error.statusCode = 422;
        throw error;
      }
      const email = req.body.email;
      const dupUser = await User.findOne({ email: email });
      if (dupUser) {
        const error = new Error(
          "A user with this e-mail address already exists."
        );
        error.statusCode = 422;
        throw error;
      }
      const name = req.body.name;
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 12);
      const buffer = crypto.randomBytes(32);
      const token = buffer.toString("hex");
      const user = new User({
        email: email,
        name: name,
        password: hashedPassword,
        verificationToken: token,
      });
      await user.save();
      res.status(201).json({
        message:
          "Follow the link we have forwaded in the e-mail address provided by you to complete the verification process.",
        userId: user._id,
      });
      await sgMail.send({
        to: email,
        from: { email: "guptapriyanshu71@gmail.com", name: "Priyanshu" },
        subject: "User Verification",
        html: `
        <p>${name}, click this <a href="http://localhost:8080/auth/verify/${token}">link</a> to become a verified member now.</p>
        `,
      });
    } catch (error) {
      next(error);
    }
  },
  generateVerifyMail: async (req, res, next) => {
    const email = req.body.email;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 404;
        throw error;
      }
      if (user.isVerified) {
        res.json("User already verified.");
      }
      await sgMail.send({
        to: email,
        from: { email: "guptapriyanshu71@gmail.com", name: "Priyanshu" },
        subject: "User Verification",
        html: `
        <p>${user.name}, click this <a href="http://localhost:8080/auth/verify/${user.verificationToken}">link</a> to become a verified member now.</p>
        `,
      });
      res.json({
        message:
          "Follow the link we have forwaded in the e-mail address provided by you to complete the verification process.",
      });
    } catch (error) {
      next(error);
    }
  },
  verifyUser: async (req, res, next) => {
    const token = req.params.token;
    try {
      const user = await User.findOne({ verificationToken: token });
      if (!user) {
        const error = new Error("Could not verify.");
        error.statusCode = 401;
        throw error;
      }
      user.isVerified = true;
      user.verificationToken = undefined;
      await user.save();
      res.json({ message: "User verified" });
    } catch (error) {
      next(error);
    }
  },
  login: async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 401;
        throw error;
      }
      const isEqual = await bcrypt.compare(password, user.password);
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }
      if (!user.isVerified) {
        const error = new Error("E-mail not verified.");
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          email: user.email,
          userId: user._id,
        },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );
      res.status(200).json({ token: token, userId: user._id });
    } catch (error) {
      next(error);
    }
  },
  generatResetToken: async (req, res, next) => {
    try {
      const buffer = crypto.randomBytes(32);
      const token = buffer.toString("hex");
      const user = await User.findOne({ email: req.body.email });
      if (!user) {
        const error = new Error("A user with this email could not be found.");
        error.statusCode = 404;
        throw error;
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      await user.save();
      res.json({ message: "An email has been sent to you." });
      await sgMail.send({
        to: req.body.email,
        from: { email: "guptapriyanshu71@gmail.com", name: "Priyanshu" },
        subject: "Password reset",
        html: `
        <h1>You requested a password reset</h1>
        <p>Click this <a href="http://localhost:8080/auth/reset/${token}">link</a> to set a new password.</p>
        `,
      });
    } catch (error) {
      next(error);
    }
  },
  verifyResetToken: async (req, res, next) => {
    const token = req.params.token;
    try {
      const user = await User.findOne({ resetToken: token });
      if (!user) {
        const error = new Error("Could not verify you.");
        error.statusCode = 401;
        throw error;
      }
      if (user.resetTokenExpiration < Date.now()) {
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        const error = new Error("Reset token expired.");
        error.statusCode = 401;
        throw error;
      }
      res.json({ message: "User verified, change password.", token: token });
    } catch (error) {
      next(error);
    }
  },
  resetPassword: async (req, res, next) => {
    const password = req.body.password;
    const token = req.body.token;
    try {
      const user = await User.findOne({ resetToken: token });
      if (!user) {
        const error = new Error("Could not verify you.");
        error.statusCode = 401;
        throw error;
      }
      if (user.resetTokenExpiration < Date.now()) {
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;
        const error = new Error("Reset token expired.");
        error.statusCode = 401;
        throw error;
      }
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiration = undefined;
      await user.save();
      res.json({ message: "Password changed successfully." });
    } catch (error) {
      next(error);
    }
  },
  getUserStatus: async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ status: user.status });
    } catch (error) {
      next(error);
    }
  },
  updateUserStatus: async (req, res, next) => {
    const newStatus = req.body.status;
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        const error = new Error("User not found.");
        error.statusCode = 404;
        throw error;
      }
      user.status = newStatus;
      await user.save();
      res.status(200).json({ message: "User status updated." });
    } catch (error) {
      next(error);
    }
  },
};
