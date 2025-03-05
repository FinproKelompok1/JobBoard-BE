import { Request, Response } from "express";
import prisma from "../prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { AuthUser } from "../types/auth";
interface MulterRequest extends Request {
  user?: AuthUser;
}
export class UserAssessmentController {
  async createUserAssessment(req: MulterRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw { message: "User ID is required." };
      }
      const { assessmentId } = req.body;
      const userSubscriptions = await prisma.userSubscription.findMany({
        where: {
          userId: userId,
          isActive: true,
        },
        include: { subscription: true },
      });
      if (!userSubscriptions.length) {
        throw { message: "No active standard subscription found." };
      }
      const hasProfessionalSubscription = userSubscriptions.some(
        (sub) => sub.subscription.category === "professional"
      );
      const standardSubscription = userSubscriptions.find(
        (sub) => sub.subscription.category === "standard"
      );
      if (
        !hasProfessionalSubscription &&
        standardSubscription?.assessmentCount! >= 2
      ) {
        throw {
          message:
            "You have reached the maximum assessment limit for a Standard subscription.",
        };
      }
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 30);
      const { id } = await prisma.userAssessment.create({
        data: { userId, assessmentId, endTime },
      });
      if (!hasProfessionalSubscription && standardSubscription) {
        await prisma.userSubscription.update({
          where: {
            userId_subscriptionId: {
              userId: userId,
              subscriptionId: standardSubscription.subscriptionId,
            },
          },
          data: { assessmentCount: { increment: 1 } },
        });
      }
      res.status(201).send({
        userAssessmentId: id,
      });
    } catch (error) {
      res
        .status(500)
        .send(error || "Server error: Unable to create user assessment.");
    }
  }
  async getUserAssessments(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const user = await prisma.user.findUnique({
        where: { username: username },
        select: { id: true },
      });
      const userAssessments = await prisma.userAssessment.findMany({
        where: { userId: user?.id },
        include: {
          User: true,
          certificate: true,
          assessment: {
            select: {
              title: true,
              AssessmentQuestion: {
                select: {
                  id: true,
                  question: true,
                  options: true,
                  correctAnswer: true,
                },
              },
            },
          },
        },
      });
      res.status(200).send({ userAssessments });
    } catch (error) {
      res.status(500).send({
        message: "Server error: Unable to retrieve user assessments.",
      });
    }
  }
  async getUserAssessmentById(req: Request, res: Response) {
    try {
      const userAssessmentId = +req.params.userAssessmentId;
      const userAssessment = await prisma.userAssessment.findUnique({
        where: { id: userAssessmentId },
        include: {
          User: true,
          certificate: true,
          assessment: {
            select: {
              title: true,
              AssessmentQuestion: {
                select: {
                  id: true,
                  question: true,
                  options: true,
                  correctAnswer: true,
                },
              },
            },
          },
        },
      });
      res.status(200).send({ userAssessment });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve user assessment." });
    }
  }
  async updateUserAssessment(req: Request, res: Response) {
    try {
      const userAssessmentId = +req.params.userAssessmentId;
      const { score } = req.body;
      await prisma.userAssessment.update({
        where: { id: userAssessmentId },
        data: { score: score, status: score >= 75 ? "passed" : "failed" },
      });
      if (score >= 75) {
        const userAssessment = await prisma.userAssessment.findUnique({
          where: { id: userAssessmentId },
          include: { User: true, assessment: true },
        });
        const assessmentTitle = userAssessment?.assessment.title
          .toLocaleLowerCase()
          .replace(/\s+/g, "-");
        const { id } = await prisma.certificate.create({
          data: {
            CertificateUrl: `${process.env.BASE_URL_FE}/certificate/${assessmentTitle}/${userAssessment?.User.username}`,
            badgeName: `${userAssessment?.assessment.title}`,
            badgeIcon:
              "https://res.cloudinary.com/difaukz1b/image/upload/v1739762156/icon/emjf6oektw1l6cywhvpu.png",
          },
        });
        await prisma.userAssessment.update({
          where: { id: userAssessmentId },
          data: { certificateId: id },
        });
      }
      res.status(200).send({
        message: "User assessment updated successfully",
      });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to update user assessment." });
    }
  }
  async downloadCertificate(req: MulterRequest, res: Response): Promise<void> {
    const username = req.params.username;
    const userAssessmentId = req.params.userAssessmentId;
    const pageUrl = `${process.env.BASE_URL_FE}/download/assessment/${username}/${userAssessmentId}/certificate`;

    try {
      console.log("🔍 Checking Chromium Path...");
      const executablePath = await chromium.executablePath();
      console.log("✅ Chromium Path:", executablePath);

      if (!executablePath) {
        console.error("❌ Error: Chromium executablePath is undefined!");
        res.status(500).send({ message: "Chromium not found!" });
        return;
      }

      // ✅ Modify Puppeteer launch settings for cloud deployment
      const browser = await puppeteer.launch({
        args: [...chromium.args, "--no-sandbox", "--disable-gpu"],
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless === "true" || true, // Ensure headless mode
      });

      console.log("✅ Puppeteer Launched");

      const page = await browser.newPage();
      const authToken = req.headers.authorization || "";
      await page.setExtraHTTPHeaders({ Authorization: authToken });

      // ✅ Pass cookies if present
      const authCookie = req.headers.cookie;
      if (authCookie) {
        const cookies = authCookie.split(";").map((cookie) => {
          const [name, value] = cookie.trim().split("=");
          return { name, value, domain: new URL(pageUrl).hostname };
        });
        await page.setCookie(...cookies);
      }

      // ✅ Navigate to the certificate page
      await page.goto(pageUrl, { waitUntil: "networkidle2" });

      // ✅ Generate and return the PDF
      const pdf = await page.pdf({
        format: "a4",
        printBackground: true,
        landscape: true,
      });

      await browser.close();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${username}-certificate.pdf`
      );
      res.setHeader("Content-Length", pdf.length);
      res.status(200).end(pdf);
    } catch (error) {
      console.error("❌ Certificate Download Error:", error);
      res.status(500).send({ message: "Failed to download certificate" });
    }
  }
}
