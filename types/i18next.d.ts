/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */
// import the original type declarations
import 'i18next';

import type { LocalizationMap } from 'discord.js';
import type { $Dictionary } from 'i18next/typescript/helpers';
import type { TOptions } from 'i18next/typescript/options';
// import all namespaces (for the default language, only)
import type en from 'locales/en.json';

declare module 'i18next' {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    // custom resources type
    resources: {
      en: typeof en;
    };
    // other
  }
}

export type MessageSchema = typeof en;

type RemovedIndexResources<T> = RemoveIndexSignature<{
  [K in keyof T]: T[K];
}>;

type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : K]: T[K];
};
export interface ComposerTranslation<
  Messages extends Record<string, any> = {},
  DefinedLocaleMessage extends
    RemovedIndexResources<MessageSchema> = RemovedIndexResources<MessageSchema>,
  C = IsEmptyObject<DefinedLocaleMessage> extends false
    ? PickupPaths<{
        [K in keyof DefinedLocaleMessage]: DefinedLocaleMessage[K];
      }>
    : never,
  M = IsEmptyObject<Messages> extends false ? PickupKeys<Messages> : never,
  ResourceKeys extends C | M = IsNever<C> extends false
    ? IsNever<M> extends false
      ? C | M
      : C
    : IsNever<M> extends false
    ? M
    : never,
  TOpt extends TOptions = TOptions,
> {
  <Key extends string>(key: Key | ResourceKeys, options?: TOpt & $Dictionary): string;
  <Key extends string>(
    key: Key | ResourceKeys,
    options?: TOpt & $Dictionary & { defaultValue: string },
  ): string;
  <Key extends string>(
    key: Key | ResourceKeys,
    defaultValue: string,
    options?: TOpt & $Dictionary,
  ): string;
}

// Need to duplicate ComposerTranslation because I haven't found out a way to only override the return type
export interface LocalizeDiscord<
  Messages extends Record<string, any> = {},
  DefinedLocaleMessage extends
    RemovedIndexResources<MessageSchema> = RemovedIndexResources<MessageSchema>,
  C = IsEmptyObject<DefinedLocaleMessage> extends false
    ? PickupPaths<{
        [K in keyof DefinedLocaleMessage]: DefinedLocaleMessage[K];
      }>
    : never,
  M = IsEmptyObject<Messages> extends false ? PickupKeys<Messages> : never,
  ResourceKeys extends C | M = IsNever<C> extends false
    ? IsNever<M> extends false
      ? C | M
      : C
    : IsNever<M> extends false
    ? M
    : never,
  TOpt extends TOptions = TOptions,
> {
  <Key extends string>(key: Key | ResourceKeys, options?: TOpt & $Dictionary): LocalizationMap;
  <Key extends string>(
    key: Key | ResourceKeys,
    options?: TOpt & $Dictionary & { defaultValue: string },
  ): LocalizationMap;
  <Key extends string>(
    key: Key | ResourceKeys,
    defaultValue: string,
    options?: TOpt & $Dictionary,
  ): LocalizationMap;
}

export interface Localized {
  t: ComposerTranslation;
}

export {};
