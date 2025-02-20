import fs from 'fs';
import { getEmbedding } from '../services/llm';
import { addItem } from '../services/vector';
import type { MetadataTypes } from 'vectra';
import { marked, type Token } from 'marked';

interface Fact extends Record<string, MetadataTypes> {
    fact: string;
    year: number;
}

const factsData = fs.readFileSync('CeresHuntFacts.md', 'utf8');
// read factsData line by line
const lines = factsData.split('\n');

const mappedFacts = lines.map((line: string) => {
    const [year, text] = line.split(' - ');
    return {
        fact: text,
        year: parseInt(year)
    }
}) as Fact[];

const getVectorForFact = async (fact: Fact) => {
    const inputText = `Year: ${fact.year} - ${fact.fact}`;
    return getEmbedding(inputText);
}

for (const data of mappedFacts) {
    const vector = await getVectorForFact(data)
    await addItem(vector, data);
}

console.log('All facts embedded successfully...');
