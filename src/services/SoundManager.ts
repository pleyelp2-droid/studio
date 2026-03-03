/**
 * @fileOverview Manages spatial audio and sound effects for Ouroboros.
 */

export class SoundManager {
  playEffect(name: string, position?: [number, number, number]) {
    console.log(`Playing sound effect: ${name}`);
  }
}

export const soundManager = new SoundManager();
