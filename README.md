# AI-Assisted RPG Boilerplate

This repository provides a boilerplate for creating AI-assisted role-playing games (RPGs). It leverages AI to enhance the adventure experience, offering dynamic storytelling, character interactions, and decision-making processes.

The project is by default defined to use ChatGPT api. To change that just change the environment variables and the [llm.ts](./services/llm.ts) file.

For the Vector Database we use the [Vectra](https://github.com/Stevenic/vectra). A free open-source local database based on JSON files. No need any configuration and works flawlessly with Bun. To change the Integration you can edit the file [vector.ts](./services/vector.ts).

At the end of the adventure the AI could also add new entries to the Knowledge Base lore in case it consider relevant info.

## Requirements:

Install Bun so you don't need to compile the Typescript and runs app faster.

[bun.sh v1.2.2 or higher](https://bun.sh)

A ChatGPT API key should be filled in `.env` file, check `.env.example`:

```sh
CHATGPT_API=sk-proj-...
```

## Installation

```bash
bun install
```

To create the vector database

```bash
bun build-database
```

Obs: Build Database will basically grab all entries on CeresHuntFacts.md and add each one of them as an embedding.

To run:

```bash
bun start
```

## File Structure

**/index.ts**  
 Serves as the main entry point that bootstraps the game, initializes chapters, and controls the game loop.

**/services/vector.ts**  
 Handles vector database operations (index creation, item insertion, and query operations). If you want to integrate another Vector Database you can just edit the functions here.

**/services/llm.ts**  
 Provides functions to interact with the OpenAI API for generating embeddings and completions.

**/components/state.ts**  
 Defines the game state, character properties, and methods to update character statuses.

**/components/startup.ts**  
 Loads and processes initial game rules and lore from markdown files to set up the adventure.

**/components/chapter.ts**  
 Orchestrates chapter progression by merging game state with LLM responses and contextualizing user interactions.

## Markdown Files

**CeresHuntBrief.md** - Contains a brief introduction for the lore containing a simplified version of the universe. With the essencial informations.

**CeresHuntFacts.md** - Contains all facts that will feed the lore of the universe in Vector Database. There is no limit of lines for this files since it will not be added to the context entirelly.

**CereshuntGameplay.md** - Contain the rules to the main gameplay, basically mounting a reduced size context to help AI keep the narrative concise.

**CeresHuntIntroduction.md** - Introduces for AI routines for initialize the adventure, creating characters and asking for the name of the ship.

**CeresHuntTalents.md** - List of the talents that characters could have. Each one with its own perks.

## References

The rulesets from Ceres Hunt is based on [Solo RPG - the simplest Ruleset of the world!](https://lbrpg.blogspot.com/2018/09/solo-rpg-simplest-world-ruleset.html). I made some simplifications on leveling due to difficulties to AI keep concise.

## License

This repository is open-sourced under the MIT License. The MIT License is a permissive license that allows for reuse, modification, and distribution with minimal restrictions. For clarity:

- You are free to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software.
- The software is provided "as is", without warranty of any kind, express or implied.
- See the [LICENSE](./LICENSE) file for the complete text of the license.
