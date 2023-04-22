import type { IBot } from '../../types/bot';
import { _bot } from '../index';

export const useBot = (): IBot => _bot;
