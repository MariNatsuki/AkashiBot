/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/consistent-type-imports,@typescript-eslint/no-empty-interface */
// Define app's Modules
import { Module } from './bot';

type Decorate<T extends Record<string, any>> = { [K in keyof T as K extends string ? `$${K}` : never]: T[K] };

type InjectionType<A extends Module> = A extends Module<infer T> ? Decorate<T> : unknown;

type ModulesInjections = InjectionType<typeof import('../src/modules/1.chat-gpt').default> &
  InjectionType<typeof import('../src/modules/0.redis').default>;

declare module './bot' {
  interface Modules extends ModulesInjections {}
}

export {};
