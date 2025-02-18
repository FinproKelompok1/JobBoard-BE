import { Router } from "express";
import { ApplyController } from "../controllers/apply.controller";
import upload from "../config/multer";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
const applyController = new ApplyController();

router.get("/submitted", requireAuth, (req, res) => {
  void applyController.getUserApplications(req, res);
});

router.post(
  "/submit/:jobId",
  requireAuth,
  upload.single("resume"),
  (req, res) => {
    void applyController.applyJob(req, res);
  }
);

export default router;
