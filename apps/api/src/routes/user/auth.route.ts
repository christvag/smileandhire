import express, { Request, Response, NextFunction } from "express";
const router = express.Router();

import { auth_service } from "../../services/user/auth";

router
    .post("/register", async (request: Request, response: Response, next: NextFunction) => {
        auth_service.registerUser(request, response, next);
    })

export default router;