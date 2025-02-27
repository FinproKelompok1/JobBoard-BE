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
exports.checkPreselection = checkPreselection;
const prisma_1 = __importDefault(require("../prisma"));
function checkPreselection(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const preselection = yield prisma_1.default.preSelectionTest.findFirst({
            where: { jobId: req.params.id },
            select: { id: true },
        });
        if (!(preselection === null || preselection === void 0 ? void 0 : preselection.id)) {
            res.status(200).send({ isThereTest: false });
            return;
        }
        return next();
    });
}
