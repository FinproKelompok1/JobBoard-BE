"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const userProfile_controller_1 = __importDefault(require("../controllers/auth/userProfile.controller"));
const multer_1 = __importDefault(require("../config/multer"));
const router = express_1.default.Router();
// Get user profile
router.get("/me", auth_middleware_1.requireAuth, userProfile_controller_1.default.getUserProfile.bind(userProfile_controller_1.default));
// Update user profile
router.put("/:userId", auth_middleware_1.requireAuth, userProfile_controller_1.default.updateUserProfile.bind(userProfile_controller_1.default));
// Upload profile image
router.post("/upload-image", auth_middleware_1.requireAuth, multer_1.default.single("image"), userProfile_controller_1.default.uploadProfileImage.bind(userProfile_controller_1.default));
exports.default = router;
