import express from "express";
import chalk from "chalk";

import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";

const app = express();
const PORT = parseInt(process.env.PORT || "5555");

app.use(express.json());

const DB_FILE = "db.json";
const adapter = new JSONFile(DB_FILE);
const db = new Low(adapter, { errors: [] });
await db.read();

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

  console.log("");
  for (const [date, counts] of rollups(db.data.errors, "message")) {
    console.log(
      `Rollups ${chalk.bold(date)} ${chalk.dim("(delete db.json to reset)")}`,
    );
    for (const [value, count] of Object.entries(counts)) {
      console.log(
        `${chalk.yellowBright(`${count}`.padStart(3))}  ${chalk.green(value)}`,
      );
    }
  }

  res.send(msg);
});

function rollups(errors, key) {
  const byDay = {};
  for (const thing of errors) {
    console.log(thing);
    break;
  }
  // return [];
  for (const { date, body } of errors) {
    const dateStr =
      typeof date === "string"
        ? date.split("T")[0]
        : date.toISOString().split("T")[0];
    if (!(dateStr in byDay)) {
      byDay[dateStr] = {};
    }
    const count = byDay[dateStr];
    const value = body[key] || "/no value/";
    // for (const body of ) {
    count[value] = (count[value] || 0) + 1;
    // }
  }
  return Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
}

function countSchemas(events) {
  const byDay = {};
  for (const { date, body } of events) {
    const dateStr =
      typeof date === "string"
        ? date.split("T")[0]
        : date.toISOString().split("T")[0];
    if (!(dateStr in byDay)) {
      byDay[dateStr] = {};
    }
    const count = byDay[dateStr];
    for (const { schema } of body.events) {
      count[schema] = (count[schema] || 0) + 1;
    }
  }
  return Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0]));
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
