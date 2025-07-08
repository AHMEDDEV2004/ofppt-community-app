/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export type ColorScheme = 'light' | 'dark';

interface ColorSchemeColors {
  text: string;
  background: string;
  tint: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const Colors: Record<ColorScheme, ColorSchemeColors> = {
  light: {
    text: '#000',
    background: '#fff',
    tint: '#3F53B4',
    tabIconDefault: '#ccc',
    tabIconSelected: '#3F53B4',
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: '#3F53B4',
    tabIconDefault: '#ccc',
    tabIconSelected: '#3F53B4',
  },
};
