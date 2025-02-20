import type { TokensList } from "marked";

export enum CharacterStatus {
    HEALTHY = 'HEALTHY',
    INJURED = 'INJURED',
    DEAD = 'DEAD'
}

export enum CharacterAction {
    LEVEL_UP = 'LEVEL_UP',
    DEATH = 'DEATH',
    INJURY = 'INJURY'
}

export interface Character {
    "char": string
    "trait": string
    "talent": string
    "level": number
    "status": CharacterStatus
}

export interface CharacterUpdate {
    "char": string,
    "action": CharacterAction,
    "level": number,
    "status": CharacterStatus
}

export class GameState {

    public characters: Character[] = [];
    public ship: string = '';
    public chapter: number = 1;

    public constructor(newCharacters: Character[], shipName: string) {
        if (!Array.isArray(newCharacters)) {
            throw new Error('newCharacters should be an array of Characters.');
        }

        this.characters = newCharacters.map((item: any) => {
            return { ...item, level: 1, status: CharacterStatus.HEALTHY } as Character;
        });

        this.ship = shipName;
    }

    public getOverview(): string {
        return `
        Here is the current state of the game:
        Chapter ${this.chapter}
        Ship: ${this.ship}
        Characters:
        ${this.characters.map(c => `${c.char} - ${c.trait} - ${c.talent} - Level ${c.level} - ${c.status}`).join('\n')}
        `;
    }

    public getCharacters(): Character[] {
        return this.characters;
    }

    public increaseChapter(): number {
        return this.chapter++;
    }

    public updateCharacter(update: CharacterUpdate): void {
        const char = this.characters.find(c => c.char === update.char);
        if (!char) throw new Error(`Character with name ${update.char} not found.`);

        switch (update.action) {
            case CharacterAction.LEVEL_UP:
                char.level++;
                break;
            case CharacterAction.DEATH:
                char.status = CharacterStatus.DEAD;
                break;
            case CharacterAction.INJURY:
                char.status = char.status === CharacterStatus.INJURED ? CharacterStatus.DEAD : CharacterStatus.INJURED;
        }
    }

}