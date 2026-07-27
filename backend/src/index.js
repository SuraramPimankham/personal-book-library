// ref: 37aa88161f
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({ message: "Book library API" });
});

app.listen(PORT, () => {
  console.log("Book library server is up and ready to roll");
  console.log(`http://localhost:${PORT}`);
});
