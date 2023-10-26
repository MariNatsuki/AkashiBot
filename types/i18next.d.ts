/* eslint-disable @typescript-eslint/ban-types,@typescript-eslint/no-explicit-any */
// import the original type declarations
import 'i18next';

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

export type LocaleKey =
  | string
  | PickupPaths<{
      [K in keyof RemovedIndexResources<MessageSchema>]: RemovedIndexResources<MessageSchema>[K];
    }>;

type NamedValue<T = {}> = T & Record<string, unknown>;

export declare interface ComposerTranslation<
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
> {
  <Key extends string>(key: Key | ResourceKeys | number): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    plural: number,
    options?: TOptions,
  ): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    defaultMsg: string,
    options?: TOptions,
  ): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    list: unknown[],
    options?: TOptions,
  ): string;
  <Key extends string>(key: Key | ResourceKeys | number, list: unknown[], plural: number): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    list: unknown[],
    defaultMsg: string,
  ): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    named: NamedValue,
    options?: TOptions,
  ): string;
  <Key extends string>(key: Key | ResourceKeys | number, named: NamedValue, plural: number): string;
  <Key extends string>(
    key: Key | ResourceKeys | number,
    named: NamedValue,
    defaultMsg: string,
  ): string;
}

export {};
