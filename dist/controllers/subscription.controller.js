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
exports.SubscriptionController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
const invoiceEmail_1 = require("../services/invoiceEmail");
const dayjs_1 = __importDefault(require("dayjs"));
class SubscriptionController {
    createSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { category, price, feature } = req.body;
                yield prisma_1.default.subscription.create({
                    data: { category, price, feature },
                });
                res.status(201).send({ message: "Subscription created successfully" });
            }
            catch (error) {
                res
                    .status(500)
                    .send({ message: "Server error: Unable to create subscription." });
            }
        });
    }
    getSubscriptions(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptions = yield prisma_1.default.subscription.findMany({
                    select: {
                        id: true,
                        category: true,
                        price: true,
                        feature: true,
                        UserSubscription: { select: { userId: true, isActive: true } },
                    },
                });
                res.status(200).send({ subscriptions });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve subscriptions.",
                });
            }
        });
    }
    getSubscriptionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptionId = req.params.subscriptionId;
                const subscription = yield prisma_1.default.subscription.findUnique({
                    where: { id: +subscriptionId },
                    select: { id: true, category: true, price: true, feature: true },
                });
                res.status(200).send({ subscription });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve subscription by ID.",
                });
            }
        });
    }
    editSubscription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subscriptionIdid = req.params.subscriptionId;
                const { category, price, feature } = req.body;
                const data = {};
                if (category !== undefined)
                    data.category = category;
                if (price !== undefined)
                    data.price = price;
                if (feature !== undefined)
                    data.feature = feature;
                if (Object.keys(data).length === 0) {
                    res.status(400).send({ message: "No fields to update provided" });
                    return;
                }
                yield prisma_1.default.subscription.update({
                    where: { id: +subscriptionIdid },
                    data,
                });
                res.status(200).send({
                    message: `Subscription ID ${subscriptionIdid} updated successfully`,
                });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to update subscription.",
                });
            }
        });
    }
    deleteSubcription(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = +req.params.subscriptionId;
                const subscription = yield prisma_1.default.subscription.findUnique({
                    where: { id },
                });
                if (!subscription) {
                    res.status(404).json({ message: "Subscription not found" });
                    return;
                }
                yield prisma_1.default.subscription.delete({ where: { id: id } });
                res
                    .status(200)
                    .json({ message: `Subscription ID ${id} deleted successfully` });
            }
            catch (error) {
                console.error("Error delete subscription :", error);
                res.status(500).send({
                    message: "Server error: Unable to delete subscription.",
                });
            }
        });
    }
    getSubscriptionUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.params.subscriptionId;
                const subscription = yield prisma_1.default.subscription.findUnique({
                    where: { id: +id },
                    select: {
                        UserSubscription: {
                            select: {
                                startDate: true,
                                endDate: true,
                                assessmentCount: true,
                                isActive: true,
                                subscription: { select: { category: true } },
                                user: {
                                    select: { email: true, fullname: true },
                                },
                            },
                        },
                    },
                });
                res
                    .status(200)
                    .send({ subscriptionUsers: subscription === null || subscription === void 0 ? void 0 : subscription.UserSubscription });
            }
            catch (error) {
                res.status(500).send({
                    message: "Server error: Unable to retrieve subscription users.",
                });
            }
        });
    }
    sendSubscriptionEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const startOfTomorrow = (0, dayjs_1.default)().add(1, "day").startOf("day").toDate();
            const endOfTomorrow = (0, dayjs_1.default)().add(1, "day").endOf("day").toDate();
            try {
                const expiringSubscription = yield prisma_1.default.userSubscription.findMany({
                    where: {
                        endDate: { gte: startOfTomorrow, lt: endOfTomorrow },
                        isActive: true,
                    },
                    include: { user: true },
                });
                for (const subscription of expiringSubscription) {
                    try {
                        yield (0, invoiceEmail_1.sendInvoiceEmail)({
                            email: subscription.user.email,
                            username: subscription.user.username,
                            fullname: subscription.user.fullname,
                        });
                    }
                    catch (emailError) {
                        console.error(`Failed to send email to ${subscription.user.email}:`, emailError);
                    }
                }
                const today = new Date();
                yield prisma_1.default.userSubscription.updateMany({
                    where: { endDate: { lt: today }, isActive: true },
                    data: { isActive: false },
                });
                res
                    .status(200)
                    .json({ message: "Subscription emails sent successfully" });
            }
            catch (error) {
                console.error("Error processing subscriptions:", error);
                res.status(500).json({ message: "Internal Server Error" });
            }
        });
    }
}
exports.SubscriptionController = SubscriptionController;
