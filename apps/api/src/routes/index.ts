import app from "express";
const router = app.Router();

import user_route from "./user/index";

router.use("/user", user_route);

export default router;