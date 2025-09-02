import app from "express"
const router = app.Router();

import auth_route from "./auth.route"

router.use("/auth", auth_route);

export default router;