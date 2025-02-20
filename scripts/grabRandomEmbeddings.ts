import fs from 'fs';
import { query } from '../services/vector';

const vector = new Array(1024).fill(0).map(() => Math.random() * 2 - 1);

(await query(vector)).forEach((item) => {
    console.log(item.score, item.item.metadata.fact);
});
