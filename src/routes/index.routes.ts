import { Router } from "express";
import authRouter from "./auth.routes.js";
import dashboardRouter from "./dashboard.routes.js";
import { routerUsuarios, routerRoles, routerPermisos } from "./usuarios.routes.js";
import materialesRouter from "./materiales.routes.js";
import bodegasRouter from "./bodegas.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/dashboard", dashboardRouter);
router.use("/usuarios", routerUsuarios);
router.use("/roles", routerRoles);
router.use("/permisos", routerPermisos);
router.use("/materiales", materialesRouter);
router.use("/bodegas", bodegasRouter);

export default router;
