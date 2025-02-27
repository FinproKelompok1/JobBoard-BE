"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileController = void 0;
const client_1 = require("../../../prisma/generated/client");
const cloudinary_1 = require("../../services/cloudinary");
const email_service_1 = require("../../services/email.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const emailService = new email_service_1.EmailService();
class UserProfileController {
    getUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const user = yield prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        CurriculumVitae: true,
                        location: true,
                        JobApplication: {
                            include: {
                                job: {
                                    include: {
                                        admin: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                res.status(200).json({
                    success: true,
                    data: user,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    updateUserProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = parseInt(req.params.userId);
                const currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!currentUserId || currentUserId !== userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { fullname, gender, dob, lastEdu, province, city, summary, experience, skill, education, } = req.body;
                const updatedUser = yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    let location = yield prisma.location.findFirst({
                        where: {
                            AND: [{ city }, { province }],
                        },
                    });
                    if (!location && city && province) {
                        try {
                            const query = `${city}+${province}+Indonesia`;
                            const { data } = yield axios_1.default.get(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=bcf87dd591a44c57b21a10bed03f5daa`);
                            if (!data.results || data.results.length === 0) {
                                throw new Error("No location data found");
                            }
                            const { lat, lng } = data.results[0].geometry;
                            location = yield prisma.location.create({
                                data: {
                                    city,
                                    province,
                                    latitude: parseFloat(lat.toString()),
                                    longitude: parseFloat(lng.toString()),
                                },
                            });
                        }
                        catch (error) {
                            location = yield prisma.location.create({
                                data: {
                                    city,
                                    province,
                                    latitude: 0,
                                    longitude: 0,
                                },
                            });
                        }
                    }
                    const user = yield prisma.user.update({
                        where: { id: userId },
                        data: {
                            fullname,
                            gender,
                            dob: dob ? new Date(dob) : undefined,
                            lastEdu,
                            domicileId: (location === null || location === void 0 ? void 0 : location.id) || null,
                        },
                        include: {
                            location: true,
                            CurriculumVitae: true,
                        },
                    });
                    if (summary || experience || skill || education) {
                        const existingCV = yield prisma.curriculumVitae.findFirst({
                            where: { userId: userId },
                        });
                        if (existingCV) {
                            yield prisma.curriculumVitae.update({
                                where: { id: existingCV.id },
                                data: {
                                    summary: summary || "",
                                    experience: experience || "",
                                    skill: skill || "",
                                    education: education || "",
                                },
                            });
                        }
                        else {
                            yield prisma.curriculumVitae.create({
                                data: {
                                    userId: userId,
                                    summary: summary || "",
                                    experience: experience || "",
                                    skill: skill || "",
                                    education: education || "",
                                },
                            });
                        }
                    }
                    return prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            location: true,
                            CurriculumVitae: true,
                        },
                    });
                }));
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to update profile" });
            }
        });
    }
    uploadProfileImage(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!req.file) {
                    res.status(400).json({ message: "No file uploaded" });
                    return;
                }
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const currentUser = yield prisma.user.findUnique({
                    where: { id: userId },
                    select: { avatar: true },
                });
                if ((currentUser === null || currentUser === void 0 ? void 0 : currentUser.avatar) &&
                    !currentUser.avatar.includes("Default_idtsln.png")) {
                    yield (0, cloudinary_1.cloudinaryRemove)(currentUser.avatar);
                }
                const result = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "profile-images");
                const updatedUser = yield prisma.user.update({
                    where: { id: userId },
                    data: { avatar: result.secure_url },
                    select: {
                        id: true,
                        avatar: true,
                    },
                });
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to upload image" });
            }
        });
    }
    changeEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { newEmail, password } = req.body;
                if (!newEmail || !password) {
                    res.status(400).json({ message: "Email and password are required" });
                    return;
                }
                const existingUser = yield prisma.user.findUnique({
                    where: { email: newEmail },
                });
                if (existingUser) {
                    res.status(400).json({ message: "Email is already in use" });
                    return;
                }
                const user = yield prisma.user.findUnique({
                    where: { id: userId },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
                if (!isPasswordValid) {
                    res.status(400).json({ message: "Current password is incorrect" });
                    return;
                }
                const token = jsonwebtoken_1.default.sign({
                    userId,
                    newEmail,
                    type: "email_change",
                }, process.env.JWT_SECRET, { expiresIn: "1h" });
                yield emailService.sendEmailChangeVerification(newEmail, token, user.fullname || user.username);
                res.status(200).json({
                    success: true,
                    message: "Verification email sent. Please check your new email to complete the change.",
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to change email" });
            }
        });
    }
    verifyEmailChange(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.query;
                if (!token || typeof token !== "string") {
                    res.status(400).json({ message: "Invalid token" });
                    return;
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
                if (decoded.type !== "email_change") {
                    res.status(400).json({ message: "Invalid token type" });
                    return;
                }
                const updatedUser = yield prisma.user.update({
                    where: { id: decoded.userId },
                    data: {
                        email: decoded.newEmail,
                        isVerified: true,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Email changed successfully",
                    user: updatedUser,
                });
            }
            catch (error) {
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    res.status(400).json({ message: "Token has expired" });
                    return;
                }
                if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    res.status(400).json({ message: "Invalid token" });
                    return;
                }
                res.status(500).json({ message: "Failed to verify email change" });
            }
        });
    }
    changePassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                const { currentPassword, newPassword } = req.body;
                if (!currentPassword || !newPassword) {
                    res
                        .status(400)
                        .json({ message: "Both current and new password are required" });
                    return;
                }
                const user = yield prisma.user.findUnique({
                    where: { id: userId },
                    select: { password: true },
                });
                if (!user) {
                    res.status(404).json({ message: "User not found" });
                    return;
                }
                const isPasswordValid = yield bcrypt_1.default.compare(currentPassword, user.password);
                if (!isPasswordValid) {
                    res.status(400).json({ message: "Current password is incorrect" });
                    return;
                }
                const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
                yield prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword },
                });
                res.status(200).json({
                    success: true,
                    message: "Password changed successfully",
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to change password" });
            }
        });
    }
    takeJob(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { jobId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    res.status(401).json({ message: "Unauthorized" });
                    return;
                }
                yield prisma.jobApplication.update({
                    where: {
                        userId_jobId: {
                            userId,
                            jobId,
                        },
                    },
                    data: {
                        isTaken: true,
                    },
                });
                res.status(200).json({
                    success: true,
                    message: "Job successfully taken",
                });
            }
            catch (error) {
                res.status(500).json({ message: "Failed to take job" });
            }
        });
    }
}
exports.UserProfileController = UserProfileController;
exports.default = new UserProfileController();
