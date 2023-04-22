/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Module } from '../../types/bot';

export const createModule = <T extends Record<string, any>>(module: Module<T>): Module<T> => module;
