import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";

dotenv.config();

const transaporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

interface InvoiceEmailParams {
  email: string;
  username: string;
  fullname: string;
}

export const sendInvoiceEmail = async ({
  email,
  username,
  fullname,
}: InvoiceEmailParams) => {
  const link = `${process.env.BASE_URL_FE}/${username}/subscription`;
  const templatePath = path.join(__dirname, "../templates", "invoiceEmail.hbs");
  const templateSource = fs.readFileSync(templatePath, "utf-8");
  const compiledTemplate = handlebars.compile(templateSource);
  const html = compiledTemplate({ fullname, username, link });

  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Subscription Renewal Invoice",
    html: html,
  };

  try {
    await transaporter.sendMail(mailOptions);
    console.log(`Invoice sent to ${email} at ${new Date()}`);
  } catch (error) {
    console.log(`Error sending invoice to ${email}: ${error}`);
  }
};
