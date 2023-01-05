import express from "express";
import chalk from "chalk";

// const { JSONFile } = require("lowdb/node");
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
const PORT = parseInt(process.env.PORT || "5555");

app.use(express.json());

const DB_FILE = "db.json";
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter);
await db.read();
db.data ||= { errors: [] };

app.get("/*", (req, res) => {
  console.log(req.url);
  const msg = `GETTING to ${req.url.slice(1)}`;
  console.log(msg);
  res.send(msg);
});
app.post("/*", (req, res) => {
  const msg = `POSTING to ${req.url.slice(1)}`;
  console.log("Error reporting!");
  for (const [key, value] of Object.entries(req.body || {})) {
    console.log("  ", chalk.bold(key), chalk.red(`${value}`.slice(0, 100)));
  }

  db.data.errors.push({
    uri: req.url.slice(1),
    date: new Date(),
    body: req.body,
  });

  db.write().then(() => {
    console.log("Reported into", DB_FILE);
  });
  console.log(msg);
  res.send(msg);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
