import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../prisma";
import { sendInvoiceEmail } from "./invoiceEmail";

cron.schedule("0 0 * * * *", async () => {
  const startOfTomorrow = dayjs().add(1, "day").startOf("day").toDate();
  const endOfTomorrow = dayjs().add(1, "day").endOf("day").toDate();

  try {
    const expiringSubscription = await prisma.userSubscription.findMany({
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

    for (const subscription of expiringSubscription) {
      try {
        await sendInvoiceEmail({
          email: subscription.user.email,
          username: subscription.user.username,
          fullname: subscription.user.fullname!,
        });
      } catch (emailError) {
        console.error(
          `Failed to send email to ${subscription.user.email}:`,
          emailError
        );
      }
    }

    const today = new Date();

    await prisma.userSubscription.updateMany({
      where: {
        endDate: { lt: today },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });
  } catch (error) {
    console.error("Error fetching/updating subscriptions:", error);
  }
});
