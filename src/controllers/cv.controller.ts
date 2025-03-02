import { Request, Response } from "express";
import prisma from "../prisma";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import { AuthUser } from "../types/auth";
interface MulterRequest extends Request {
  user?: AuthUser;
}

export class CvController {
  async createCv(req: MulterRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id!;
      const { summary, experience, education, skill } = req.body;

      await prisma.curriculumVitae.create({
        data: {
          userId,
          summary,
          experience,
          education,
          skill,
        },
      });

      res.status(201).send({ message: "CV created successfully" });
    } catch (error) {
      res.status(500).send({ message: "Server error: Unable to generate CV." });
    }
  }

  async getUserCv(req: Request, res: Response) {
    try {
      const username = req.params.username;
      const userCv = await prisma.user.findUnique({
        where: { username },
        select: {
          fullname: true,
          email: true,
          location: { select: { city: true, province: true } },
          CurriculumVitae: {
            select: {
              id: true,
              summary: true,
              experience: true,
              education: true,
              skill: true,
            },
          },
        },
      });
      res.status(200).send({ userCv });
    } catch (error) {
      res
        .status(500)
        .send({ message: "Server error: Unable to retrieve user CV." });
    }
  }

  async getCvById(req: Request, res: Response) {
    try {
      const cvId = req.params.cvId;
      const cv = await prisma.curriculumVitae.findUnique({
        where: { id: +cvId },
        select: {
          id: true,
          summary: true,
          experience: true,
          education: true,
          skill: true,
        },
      });

      res.status(200).send({ cv });
    } catch (error) {
      res.status(500).send({ message: "Server error: Unable to retrieve CV." });
    }
  }

  async updateCv(req: Request, res: Response) {
    try {
      const cvId = req.params.cvId;
      const { summary, experience, education, skill } = req.body;

      const data: {
        summary?: string;
        experience?: string;
        education?: string;
        skill?: string;
      } = {};

      if (summary !== undefined) data.summary = summary;
      if (experience !== undefined) data.experience = experience;
      if (education !== undefined) data.education = education;
      if (skill !== undefined) data.skill = skill;

      if (Object.keys(data).length === 0) {
        res.status(400).send({ message: "No fields to update provided" });
        return;
      }

      await prisma.curriculumVitae.update({
        where: { id: +cvId },
        data,
      });

      res.status(200).send({ message: `CV updated successfully` });
    } catch (error) {
      res.status(500).send({ message: "Server error: Unable to update CV." });
    }
  }

  async downloadCv(req: MulterRequest, res: Response): Promise<void> {
    const username = req.params.username;
    const pageUrl = `${process.env.BASE_URL_FE}/download/cv/${username}`;

    try {
      console.log("🔍 Checking Chromium Path...");
      const executablePath = await chromium.executablePath();
      console.log("✅ Chromium Path:", executablePath);

      // Check if executablePath is valid
      if (!executablePath) {
        console.error("❌ Error: Chromium executablePath is undefined!");
        res.status(500).send({ message: "Chromium not found!" });
        return;
      }

      // Launch Puppeteer
      const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath,
        headless: chromium.headless === "true" || true, // Ensure true
      });

      console.log("✅ Puppeteer Launched");

      // Open new page
      const page = await browser.newPage();
      console.log("🌍 Navigating to:", pageUrl);

      // Add Authorization header
      const authToken = req.headers.authorization || "";
      await page.setExtraHTTPHeaders({ Authorization: authToken });

      // Add Cookies (if available)
      const authCookie = req.headers.cookie;
      if (authCookie) {
        console.log("🍪 Setting Cookies");
        const cookies = authCookie.split(";").map((cookie) => {
          const [name, value] = cookie.trim().split("=");
          return { name, value, domain: new URL(pageUrl).hostname };
        });
        await page.setCookie(...cookies);
      }

      // Navigate to the page
      try {
        await page.goto(pageUrl, {
          waitUntil: "load",
          timeout: 8000,
        });
        console.log("✅ Page Loaded Successfully");
      } catch (err) {
        console.error("❌ Failed to load page:", err);
        await browser.close();
        res.status(500).send({ message: "Failed to generate CV PDF" });
        return;
      }

      // Generate PDF
      try {
        console.log("📄 Generating PDF...");
        const pdf = await page.pdf({
          format: "a4",
          printBackground: true,
          margin: { top: "10mm", right: "10mm", bottom: "10mm", left: "10mm" },
        });
        console.log("✅ PDF Generated Successfully");

        await browser.close();

        // Send PDF response
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=${username}.pdf`
        );
        res.setHeader("Content-Length", pdf.length);
        res.status(200).end(pdf);
      } catch (pdfError) {
        console.error("❌ Error generating PDF:", pdfError);
        await browser.close();
        res.status(500).send({ message: "Failed to generate PDF" });
      }
    } catch (error) {
      console.error("❌ Server error:", error);
      res.status(500).send({ message: "Server error: Unable to download CV." });
    }
  }
}
