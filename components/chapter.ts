import * as fs from 'fs';
import path from 'path';
import { getCompletion, getEmbedding } from '../services/llm';
import { addItem, queryAsContext, queryRandomVectors } from '../services/vector';
import { marked } from 'marked';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

import { log, spinner } from '@clack/prompts';
import boxen from 'boxen';
import type { GameState } from './state';

export const getGameplayRules = () => {
    const lore = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntBrief.md'), 'utf-8');
    const talents = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntTalents.md'), 'utf-8');
    const rules = fs.readFileSync(path.join(__dirname, '..', 'CeresHuntGameplay.md'), 'utf-8');
    return rules.replace('{{talents}}', talents).replace('{{lore}}', lore);
}

// GAMEPLAY MESSAGES MEMORY
let messages = [
    {
        role: 'developer',
        content: getGameplayRules()
    }
]

export const addMessage = async (role: 'user' | 'developer', message: string) => {
    messages.push({
        role,
        content: message
    })
}

export const initializeChapter = async (gameState: GameState) => {

    const overview = gameState.getOverview();
    messages.push({
        role: 'developer',
        content: overview || ''
    });

    // Add random facts to the message array so assistant will be more creative.
    const randomFacts = queryRandomVectors();
    messages.push({
        role: 'assistant',
        content: 'These are additional facts related to the Lore of Ceres Hunt that could help to elaborate outcomes: ' + randomFacts
    });

    const initial = await getCompletion(messages as ChatCompletionMessageParam[]);

    messages.push({
        role: 'assistant',
        content: initial || ''
    });

    return initial
}

export const contextualizeAndQuery = async (message: string, gameState: GameState) => {

    // Keep only the first Developer message
    messages = messages.filter((msg, index) => msg.role !== 'developer' || index === 0);

    // Add the Game State overview to the message array
    const overview = gameState.getOverview();
    messages.push({
        role: 'developer',
        content: overview || ''
    });

    // Add the user message to the message array
    messages.push({
        role: 'user',
        content: message
    });

    const s = spinner();
    s.start('Contextualizing lore...');
    // Check the embedding of the request from the user
    const userEmbedding = await getEmbedding(message);
    // Compare the embedding with the embeddings of the important facts in the vector database
    const similarFacts = await queryAsContext(userEmbedding);
    s.stop('Contextualized.');
    log.info(boxen(similarFacts, { title: 'Ceres Hunt Enciclopedia', padding: 1, width: 100 }));

    // Add the most similar important facts to the message array
    messages.push({
        role: 'developer',
        content: 'These are additional facts related to the Lore of Ceres Hunt that could help to ellaborate outcomes: ' + similarFacts
    });

    s.start('Querying Master...');
    // Receive the response from the LLM
    const llmResponse = await getCompletion(messages as ChatCompletionMessageParam[]);

    messages.push({
        role: 'assistant',
        content: llmResponse || ''
    });
    s.stop('Responded.');
    // Return the message from LLM
    return llmResponse;
}

export const grabFactFromChapter = async () => {

    // Keep only the first Developer message
    messages = messages.filter((msg, index) => msg.role !== 'developer' || index === 0);

    // Add the Game State overview to the message array
    messages.push({
        role: 'developer',
        content: `
        Based on the whole conversation and narrative.
        What is the most important piece of the puzzle that the crew discovered?
        Respond in a single sentence some piece of information that could be useful for the future adventurers.
        The information should be written as a third party writter that doesn't know the name of the crew member or the ship.
        `
    });

    // Based on the story present in the narrative, ask a for a discovery made by the crew.
    const s = spinner();
    s.start('Asking for a new fact...');
    const newFact = await getCompletion(messages as ChatCompletionMessageParam[]);
    s.stop('Adding information to Ceres Hunt Lore.');

    if (newFact) {
        const inputText = `Year: ${new Date().getFullYear()} - ${newFact}`;
        const embed = await getEmbedding(inputText);
        await addItem(embed, {
            year: new Date().getFullYear(),
            fact: newFact || '',
        });
    }

    return newFact || 'No Relevant information discovered.';
}