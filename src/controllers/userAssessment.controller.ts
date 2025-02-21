import { Request, Response } from "express";
import prisma from "../prisma";
import puppeteer from "puppeteer";
import { AuthUser } from "../types/auth";
interface MulterRequest extends Request {
  user?: AuthUser;
}
export class UserAssessmentController {
  async createUserAssessment(req: MulterRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { assessmentId } = req.body;
      const userSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: userId,
          isActive: true,
          subscription: { category: "standard" },
        },
        include: { subscription: true },
      });
      if (userSubscription?.assessmentCount! >= 2)
        throw { message: "You has reached the maximum assessment limit." };
      const endTime = new Date();
      endTime.setMinutes(endTime.getMinutes() + 30);
      const { id } = await prisma.userAssessment.create({
        data: { userId, assessmentId, endTime },
      });
      await prisma.userSubscription.update({
        where: {
          userId_subscriptionId: {
            userId: userId,
            subscriptionId: userSubscription?.subscriptionId!,
          },
        },
        data: { assessmentCount: { increment: 1 } },
      });

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
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      const authToken = req.headers.authorization || "";
      await page.setExtraHTTPHeaders({
        Authorization: authToken,
      });
      const authCookie = req.headers.cookie; // Get cookies from the request
      if (authCookie) {
        const cookies = authCookie.split(";").map((cookie) => {
          const [name, value] = cookie.trim().split("=");
          return { name, value, domain: new URL(pageUrl).hostname };
        });
        await page.setCookie(...cookies);
      }
      try {
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
      } catch (error) {
        console.error("Failed to load page:", error);
        res.status(500).send({ message: "Failed to generate certificate" });
        return;
      }
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        landscape: true,
      });
      await browser.close();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${username}.pdf`
      );
      res.setHeader("Content-Length", pdf.length);
      res.status(200).end(pdf);
    } catch (error) {
      console.error("Error downloading certificate:", error);
      res.status(500).send({ message: "Failed to download certificate" });
    }
  }
}
