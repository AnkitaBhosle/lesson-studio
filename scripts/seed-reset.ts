import { writeSeedToDisk } from "../packages/orchestrator/src/store";

const file = writeSeedToDisk();
console.log(`Seed written to ${file}`);
