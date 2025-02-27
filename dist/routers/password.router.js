"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const password_controller_1 = require("../controllers/auth/password.controller");
const auth_1 = require("../middlewares/auth");
const router = express_1.default.Router();
const passwordController = new password_controller_1.PasswordController();
router.post("/forgot-password", passwordController.forgotPassword);
router.post("/reset-password", passwordController.resetPassword);
router.put("/change-password", auth_1.requireAuth, passwordController.changePassword);
exports.default = router;
