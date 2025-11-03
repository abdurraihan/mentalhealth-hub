import express, { Application } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoutes";
import errorHandler from "./middlewares/errorHandler";
import adminRoutes from "./routes/adminRoutes";
import userManagementRouts from "./routes/userManagementRoutes";
import crisisCallsRoutes from "./routes/crisisCallsRoutes";
import mobileCrisisRoutes from "./routes/mobileCrisisRoutes";
import crisisStabilizationUnitRoutes from "./routes/crisisStabilizationUnitRoutes";
import dashboardSummaryRoutes from "./routes/dashboardSummaryRoutes"
import userSummaryRoutes from "./routes/userSummaryRouter";
dotenv.config();

const app: Application = express();

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));


// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/management",userManagementRouts)
app.use("/api/crisis_calls", crisisCallsRoutes)
app.use("/api/mobile_crisis", mobileCrisisRoutes)
app.use("/api/crisis_stabilization_unit", crisisStabilizationUnitRoutes)
app.use("/api/dashboard",dashboardSummaryRoutes)
app.use("/api/user", userSummaryRoutes);

// Error handler
app.use(errorHandler);

export default app;
