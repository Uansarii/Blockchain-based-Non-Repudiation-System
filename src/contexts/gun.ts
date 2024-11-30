import { IGunInstance } from "gun";
import { createContext } from "react";

const GunContext = createContext<IGunInstance | null>(null);

export default GunContext;
