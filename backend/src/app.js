const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("API is running!");
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/monsters", require("./routes/monsters"));
app.use("/api/pvp", require("./routes/pvp"));
app.use("/api/inventory", require("./routes/inventory"));
app.use("/api/quests", require("./routes/quests"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
