import { LocalIndex, type MetadataTypes } from 'vectra';
import path from "path";
import { log } from '@clack/prompts';

const index = new LocalIndex(path.join(__dirname, '..', 'database'));
if (!await index.isIndexCreated()) {
    await index.createIndex();
}

export async function addItem(vector: number[], metadata: Record<string, MetadataTypes>) {
    await index.insertItem({
        vector: vector,
        metadata: metadata
    });
    log.info(`Another fact added to Ceres Hunt Lore: ${metadata.fact}`);
}

export async function query(vector: number[]) {
    return await index.queryItems(vector, 5);
}

export async function queryAsContext(vector: number[]) {
    const item = await index.queryItems(vector, 5);
    return item.map(({ item }) => item.metadata.fact).join('\n');
}

export async function queryRandomVectors() {
    const vector = new Array(1024).fill(0).map(() => Math.random() * 2 - 1);
    return await queryAsContext(vector);
}