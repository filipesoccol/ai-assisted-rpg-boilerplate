import { isCancel, cancel, text, multiselect, spinner, log, intro } from '@clack/prompts';
import { lexer, type TokensList } from 'marked';
import chalk from 'chalk';
import figlet from 'figlet';

import { initializeAdventure } from './components/startup';
import { initializeChapter, contextualizeAndQuery } from './components/chapter';
import { CharacterStatus, GameState, type Character } from './components/state';
import boxen from 'boxen';

const s = spinner();

// INTRODUCTION
intro(chalk.white.bold('Welcome to'));
log.info(chalk.magenta(figlet.textSync('Ceres Hunt', { font: 'Double' })));

// Initialize first query to pass the instructions to AI and receive the list of characters
s.start('Initializing Adventure...');
const adventure = await initializeAdventure();
s.stop('Initialization completed');

// Grab character list from AI response
const charactersList = adventure
  .filter((item: any) => item.type === 'code')
  .map((item: any) => item.text)
  .map((text: string) => JSON.parse(text));

// Log Character list on console
log.warn('Characters:');
log.info(charactersList.map((character: any) => {
  return `${character.char} - ${character.trait} - ${character.talent}`;
}).join('\n'));

// Query user for Ship name
const ship: string = await text({
  message: 'What is the name of your ship?',
}) as string;

// Initialize Game State
const gameState = new GameState(charactersList, ship);

// Initialize first chapter
const chapter = await initializeChapter(gameState);
log.warn(boxen(chapter || '', { title: 'Adventure starts', padding: 1, width: 100 }));

// Initialize Chapters Loop
while (true) {

  // List characters to choose for risk
  const charactersList = await gameState.getCharacters();
  const chars = charactersList.filter(c => c.status != CharacterStatus.DEAD).map((character: Character) => {
    return {
      value: character.char,
      label: `${character.char} (${character.status})`,
      hint: `${character.trait} - ${character.talent} - Level ${character.level}`,
    }
  });
  const toRisk = await multiselect({
    message: 'Select heroes to risk',
    options: chars,
    required: true,
  });

  if (isCancel(toRisk)) {
    cancel('Game Exited.');
    process.exit(0);
  }

  const value = await text({
    message: 'What will be the action of the selected characters?',
  });

  if (isCancel(value)) {
    cancel('Game Exited.');
    process.exit(0);
  }

  const response = await contextualizeAndQuery(`With this selected characters` + toRisk + 'do' + value, gameState);
  // Grab the JSON with updates from the response
  const responseLexed = lexer(response || '')
  const paragraphs = responseLexed.filter((item: any) => item.type === 'paragraph') as TokensList;
  // Store last paragraph to use as question for the user
  const remainingText = paragraphs.map((item: any) => item.text).join('\n');
  log.warn(boxen(remainingText || '', { title: 'Outcome', width: 100 }));
  const updates = responseLexed.filter((item: any) => item.type === 'code') as TokensList;
  for (const update of updates) {
    try {
      // @ts-expect-error
      await gameState.updateCharacter(JSON.parse(update.text));
    } catch (error: any) {
      console.log(`Error updating character: ${error.message}`);
    }
  }

  //       updateCharacter(JSON.parse(update.text));
  //     } catch (error: any) {
  //       console.log(`Error updating character: ${error.message}`);
  //     }
  //   }

}
