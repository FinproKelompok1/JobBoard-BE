import { Request, Response } from "express";
import prisma from "../prisma";
import puppeteer from "puppeteer";

export class CvController {
  async createCv(req: Request, res: Response) {
    try {
      const userId = 1;
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
      console.error("Error generating CV:", error);
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
      console.log("Error retrieving user CV:", error);
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
      console.error("Error retrieving CV by ID:", error);
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

      res.status(200).send({ message: `CV ID ${cvId} updated successfully` });
    } catch (error) {
      console.error("Error updating CV:", error);
      res.status(500).send({ message: "Server error: Unable to update CV." });
    }
  }

  async downloadCv(req: Request, res: Response) {
    const username = req.params.username;
    const pageUrl = `${process.env.BASE_URL_FE}/${username}/cv/download`;

    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      try {
        await page.goto(pageUrl, { waitUntil: "networkidle2" });
      } catch (err) {
        console.error("Failed to load page:", err);
        res.status(500).send({ message: "Failed to generate CV PDF" });
        return;
      }

      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "15mm",
          right: "20mm",
          bottom: "15mm",
          left: "20mm",
        },
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
      console.error("Error downloading CV:", error);
      res.status(500).send({ message: "Server error: Unable to download CV." });
    }
  }
}
