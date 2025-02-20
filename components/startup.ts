import * as fs from 'fs';
import path from 'path';
import { getCompletion } from '../services/llm';
import { marked } from 'marked';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export const getInitialRules = () => {
    const lore = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntBrief.md'), 'utf-8');
    const talents = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntTalents.md'), 'utf-8');
    const rules = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntIntroduction.md'), 'utf-8');
    return rules.replace('{{talents}}', talents).replace('{{lore}}', lore);
}

/// INTIALIZATION MESSAGES MEMORY
const messages = [
    {
        role: 'developer',
        content: getInitialRules()
    }
]

export const initializeAdventure = async () => {

    const initial = await getCompletion(messages as ChatCompletionMessageParam[], 1.5);
    messages.push({
        role: 'assistant',
        content: initial || ''
    });

    const lexedInitial = marked.lexer(initial || '');

    return lexedInitial;
}