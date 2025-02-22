"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticController = void 0;
const prisma_1 = __importDefault(require("../prisma"));
class AnalyticController {
    getTotalDemographics(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = 2;
                const gender = yield prisma_1.default.$queryRaw `
        SELECT u."gender" AS "type", CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY "type"
      `;
                const ageRaw = yield prisma_1.default.$queryRaw `
        SELECT
          EXTRACT(YEAR FROM AGE(u.dob)) AS age,
          CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" AS ja
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY age
      `;
                const formattedAge = [
                    { age: "<18", total: 0 },
                    { age: "18-25", total: 0 },
                    { age: "26-32", total: 0 },
                    { age: "33-40", total: 0 },
                    { age: "40<", total: 0 },
                ];
                for (const item of ageRaw) {
                    const { age, total } = item;
                    if (age < 18) {
                        formattedAge[0].total += total;
                    }
                    else if (age >= 18 && age <= 25) {
                        formattedAge[1].total += total;
                    }
                    else if (age >= 26 && age <= 32) {
                        formattedAge[2].total += total;
                    }
                    else if (age >= 33 && age <= 40) {
                        formattedAge[3].total += total;
                    }
                    else {
                        formattedAge[4].total += total;
                    }
                }
                const location = yield prisma_1.default.$queryRaw `
        SELECT l.city, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Location" l ON u."domicileId" = l."id"
        WHERE a."id" = ${adminId}
        GROUP BY l.city
      `;
                const education = yield prisma_1.default.$queryRaw `
        SELECT u."lastEdu" AS education, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "User" u on ja."userId" = u."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY u."lastEdu"
      `;
                res.status(200).send({
                    result: {
                        age: formattedAge,
                        gender,
                        location,
                        education,
                    },
                });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    getSalaryTrends(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = 2;
                const basedOnJobRole = yield prisma_1.default.$queryRaw `
        SELECT j.role, CAST(AVG(r.salary) AS INT) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY j.role
      `;
                const basedOnJobLocation = yield prisma_1.default.$queryRaw `
        SELECT l.city, CAST(AVG(r.salary) AS INT) AS avgSalary
        FROM "Job" j
        JOIN "Review" r ON j."id" = r."jobId"
        JOIN "Location" l ON j."locationId" = l."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY l.city
      `;
                res.status(200).send({ result: { basedOnJobRole, basedOnJobLocation } });
            }
            catch (err) {
                console.log(err);
                res.status(200).send(err);
            }
        });
    }
    getApplicantInterest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const adminId = 2;
                const basedOnJobCategory = yield prisma_1.default.$queryRaw `
        SELECT j.category, CAST(COUNT(*) AS INT) AS total
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY j.category
      `;
                const basedOnExpectedSalary = yield prisma_1.default.$queryRaw `
        SELECT j.category, CAST(AVG(ja."expectedSalary") AS INT) AS avgSalary
        FROM "JobApplication" ja
        JOIN "Job" j on ja."jobId" = j."id"
        JOIN "Admin" a on j."adminId" = a."id"
        WHERE a."id" = ${adminId}
        GROUP BY j.category
      `;
                res
                    .status(200)
                    .send({ result: { basedOnJobCategory, basedOnExpectedSalary } });
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
}
exports.AnalyticController = AnalyticController;
