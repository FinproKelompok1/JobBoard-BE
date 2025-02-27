"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const userProfile_controller_1 = __importDefault(require("../controllers/auth/userProfile.controller"));
const multer_1 = __importDefault(require("../config/multer"));
const router = express_1.default.Router();
router.get("/me", auth_1.requireAuth, userProfile_controller_1.default.getUserProfile.bind(userProfile_controller_1.default));
router.put("/:userId", auth_1.requireAuth, userProfile_controller_1.default.updateUserProfile.bind(userProfile_controller_1.default));
router.post("/upload-image", auth_1.requireAuth, multer_1.default.single("image"), userProfile_controller_1.default.uploadProfileImage.bind(userProfile_controller_1.default));
router.put("/change-password", auth_1.requireAuth, userProfile_controller_1.default.changePassword);
router.put("/applications/:jobId/take", auth_1.requireAuth, userProfile_controller_1.default.takeJob.bind(userProfile_controller_1.default));
router.put("/change-email", auth_1.requireAuth, userProfile_controller_1.default.changeEmail.bind(userProfile_controller_1.default));
router.get("/verify-email-change", userProfile_controller_1.default.verifyEmailChange.bind(userProfile_controller_1.default));
exports.default = router;
