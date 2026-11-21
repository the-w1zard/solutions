import type { DefaultThemeGroupIds, ThemeGetter } from "./types";
export declare const fromTheme: <AdditionalThemeGroupIds extends string = never, DefaultThemeGroupIdsInner extends string = DefaultThemeGroupIds>(key: NoInfer<DefaultThemeGroupIdsInner | AdditionalThemeGroupIds>) => ThemeGetter;
