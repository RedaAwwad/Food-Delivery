import express from "express";
const PORT = process.env.PORT || 6000;

const app = express();
app.use(express.json());

app.use("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
