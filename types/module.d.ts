/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/consistent-type-imports,@typescript-eslint/no-empty-interface */
// Define app's Modules
import { Module } from './bot';

type Decorate<T extends Record<string, any>> = {
  [K in keyof T as K extends string ? `$${K}` : never]: T[K];
};

type InjectionType<A extends Module> = A extends Module<infer T> ? Decorate<T> : unknown;

type ModulesInjections = InjectionType<typeof import('../src/modules/0.redis').default> &
  InjectionType<typeof import('../src/modules/1.i18n.ts').default> &
  InjectionType<typeof import('../src/modules/2.chat-gpt.ts').default> &
  InjectionType<typeof import('../src/modules/rest.ts').default>;

declare module './bot' {
  interface Modules extends ModulesInjections {}
}

export {};
