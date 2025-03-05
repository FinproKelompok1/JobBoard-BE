// import cron from "node-cron";
import dayjs from "dayjs";
import prisma from "../prisma";
import { sendRemainderEmail } from "./reminderEmail";
import { formatDate } from "../helpers/dateFormatter";
import { formatTime } from "../helpers/timeFormatter";

export const interviewReminder = async () => {
  const startOfTomorrow = dayjs().add(1, "day").startOf("day").toDate();
  const endOfTomorrow = dayjs().add(1, "day").endOf("day").toDate();
  try {
    const interviewRemindered = await prisma.interview.findMany({
      where: {
        startTime: {
          gte: startOfTomorrow,
          lt: endOfTomorrow,
        },
      },
      select: {
        startTime: true,
        user: {
          select: {
            fullname: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
            admin: {
              select: {
                companyName: true,
              },
            },
          },
        },
      },
    });

    for (const interview of interviewRemindered) {
      try {
        await sendRemainderEmail({
          email: interview.user.email,
          applicant_name: interview.user.fullname,
          job_title: interview.job.title,
          company_name: interview.job.admin.companyName,
          date: formatDate(`${interview.startTime}`),
          time: formatTime(`${interview.startTime}`),
        });
      } catch (err) {
        console.log(err);
      }
    }
  } catch (err) {
    console.error("schedule", err);
  }
};

// cron.schedule("0 0 4 * * *", async () => {

// });
