import { createRequire } from "node:module";
const mongoose = createRequire(import.meta.url)("mongoose");
export const { Schema, model, models } = mongoose;
export default mongoose;
