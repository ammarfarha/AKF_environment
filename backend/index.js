import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
// Routes
import authRoutes from "./Routes/AuthRoute.js";
import userRoutes from "./Routes/UserRoute.js";
import surveyTemplateRoutes from "./Routes/SurveyTemplateRoute.js";
import projectRotes from "./Routes/ProjectRoute.js";
import surveyProjectRoutes from "./Routes/SurveyProjectRoute.js";

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = process.env.PORT || 3001;
const data = process.env.DATA;

// connect to database
mongoose.connect(data).then(() => {
    console.log("Data Connected successfully");
    app.listen(port, () => {
        console.log(`Server Work On Port ${port}`);
        console.log(`http://localhost:${port}`);
    });
}).catch((error) => {
    console.log(error);
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/surveyTemplate", surveyTemplateRoutes);
app.use("/api/project", projectRotes);
app.use("/api/surveyProject", surveyProjectRoutes);

