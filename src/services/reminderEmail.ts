import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { transporter } from "./mailer";

interface IProps {
  email: string;
  applicant_name: string | null;
  job_title: string;
  company_name: string;
  date: string;
  time: string;
}

export const sendRemainderEmail = async ({
  email,
  applicant_name,
  job_title,
  company_name,
  date,
  time,
}: IProps) => {
  const templatePath = path.join(
    __dirname,
    "../templates",
    "interviewReminder.html"
  );
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateSource);
  const html = compiledTemplate({
    applicant_name,
    job_title,
    company_name,
    date,
    time,
  });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Upcoming Interview Reminder - Don't Be Late!",
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log(`Error`, err);
  }
};
