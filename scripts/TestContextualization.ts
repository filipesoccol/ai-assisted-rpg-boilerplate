import { extractFact, getLore } from "../components/startup";

console.log(JSON.parse(await extractFact('Jeff used his plasma cannon and destroyed a pirate ship.')));