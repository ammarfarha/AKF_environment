import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


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

