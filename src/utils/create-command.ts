import type { Command } from '../interfaces/command';

export const createCommand = <C extends Command>(command: C) => command;
