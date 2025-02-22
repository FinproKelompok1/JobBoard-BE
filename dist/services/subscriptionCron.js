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
const node_cron_1 = __importDefault(require("node-cron"));
const dayjs_1 = __importDefault(require("dayjs"));
const prisma_1 = __importDefault(require("../prisma"));
const invoiceEmail_1 = require("./invoiceEmail");
node_cron_1.default.schedule("0 0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Running subscription check job at ${new Date()}`);
    const startOfTomorrow = (0, dayjs_1.default)().add(1, "day").startOf("day").toDate();
    const endOfTomorrow = (0, dayjs_1.default)().add(1, "day").endOf("day").toDate();
    try {
        const expiringSubscription = yield prisma_1.default.userSubscription.findMany({
            where: {
                endDate: {
                    gte: startOfTomorrow,
                    lt: endOfTomorrow,
                },
                isActive: true,
            },
            include: {
                user: true,
            },
        });
        expiringSubscription.forEach((item) => {
            console.log(`Subscription user ID ${item.userId} and subscription ID ${item.subscriptionId} ends at:`, item.endDate);
        });
        for (const subscription of expiringSubscription) {
            try {
                yield (0, invoiceEmail_1.sendInvoiceEmail)({
                    email: subscription.user.email,
                    username: subscription.user.username,
                    fullname: subscription.user.fullname,
                });
                console.log(`Invoice sent to ${subscription.user.email} at ${new Date()}`);
            }
            catch (emailError) {
                console.error(`Failed to send email to ${subscription.user.email}:`, emailError);
            }
        }
        const today = new Date();
        yield prisma_1.default.userSubscription.updateMany({
            where: {
                endDate: { lt: today },
                isActive: true,
            },
            data: {
                isActive: false,
            },
        });
    }
    catch (error) {
        console.error("Error fetching/updating subscriptions:", error);
    }
}));
