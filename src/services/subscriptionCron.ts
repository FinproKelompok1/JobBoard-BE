import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../prisma";
import { sendInvoiceEmail } from "./invoiceEmail";

cron.schedule("0 0 * * * *", async () => {
  console.log(`Running subscription check job at ${new Date()}`);

  const startOfTomorrow = dayjs().add(1, "day").startOf("day").toDate();
  const endOfTomorrow = dayjs().add(1, "day").endOf("day").toDate();

  console.log(
    "Checking for subscriptions expiring between:",
    startOfTomorrow,
    "and",
    endOfTomorrow
  );

  try {
    const allSubs = await prisma.userSubscription.findMany();
    console.log("All subscriptions:", allSubs);

    const soonExpiredSubs = await prisma.userSubscription.findMany({
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

    soonExpiredSubs.forEach((sub) => {
      console.log(
        `Subscription user ID ${sub.userId} and subscription ID ${sub.subscriptionId} ends at:`,
        sub.endDate
      );
    });

    console.log("soonExpiredSubs", soonExpiredSubs);

    for (const subscription of soonExpiredSubs) {
      try {
        await sendInvoiceEmail({
          email: subscription.user.email,
          username: subscription.user.username,
          fullname: subscription.user.fullname!,
        });
        console.log(
          `Invoice sent to ${subscription.user.email} at ${new Date()}`
        );
      } catch (emailError) {
        console.error(
          `❌ Failed to send email to ${subscription.user.email}:`,
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

    console.log(`Subscriptions status updated at ${new Date()}`);
  } catch (dbError) {
    console.error("❌ Error fetching/updating subscriptions:", dbError);
  }
});
