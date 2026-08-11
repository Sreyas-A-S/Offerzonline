import { initializeDatabase } from "./init";

initializeDatabase()
  .then(() => {
    console.log("Initialization complete");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Init error:", err);
    process.exit(1);
  });
