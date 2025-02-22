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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserProfileController = void 0;
const client_1 = require("../../../prisma/generated/client");
const cloudinary_1 = require("../../services/cloudinary");
const prisma = new client_1.PrismaClient();
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
                        Review: true,
                        CurriculumVitae: true,
                        UserAssessment: {
                            include: { certificate: true, assessment: true, User: true },
                        },
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
                console.error("Error fetching profile:", error);
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
                const { 
                // Profile data
                fullname, gender, dob, lastEdu, 
                // CV data
                summary, experience, skill, education, } = req.body;
                const updatedUser = yield prisma.$transaction((prisma) => __awaiter(this, void 0, void 0, function* () {
                    // Update user profile
                    const user = yield prisma.user.update({
                        where: { id: userId },
                        data: {
                            fullname,
                            gender,
                            dob: dob ? new Date(dob) : undefined,
                            lastEdu,
                        },
                    });
                    // First, check if CV exists for this user
                    const existingCV = yield prisma.curriculumVitae.findFirst({
                        where: { userId: userId },
                    });
                    if (existingCV) {
                        // Update existing CV
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
                        // Create new CV
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
                    // Return updated user with CV
                    return prisma.user.findUnique({
                        where: { id: userId },
                        include: {
                            CurriculumVitae: true,
                            location: true,
                        },
                    });
                }));
                res.status(200).json({
                    success: true,
                    data: updatedUser,
                });
            }
            catch (error) {
                console.error("Error updating profile:", error);
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
                console.error("Error uploading image:", error);
                res.status(500).json({ message: "Failed to upload image" });
            }
        });
    }
}
exports.UserProfileController = UserProfileController;
exports.default = new UserProfileController();
