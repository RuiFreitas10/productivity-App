import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const THEME_PALETTES = {
    green: {
        id: 'green',
        name: 'Verde (Original)',
        primary: '#CCFF00',
        secondary: '#2E3D0C',
        background: '#0D0D0D', // Slightly darker than #121212
    },
    purple: {
        id: 'purple',
        name: 'Roxo Galaxy',
        primary: '#D946EF', // Fuchsia-500
        secondary: '#4A044E',
        background: '#0F0712', // Deep purple-black
    },
    blue: {
        id: 'blue',
        name: 'Azul Elétrico',
        primary: '#3B82F6', // Blue-500
        secondary: '#172554',
        background: '#020617', // Slate-950
    },
    orange: {
        id: 'orange',
        name: 'Laranja Pôr-do-Sol',
        primary: '#F97316', // Orange-500
        secondary: '#431407',
        background: '#0C0402',
    },
    pink: {
        id: 'pink',
        name: 'Rosa Neon',
        primary: '#FF0080',
        secondary: '#500028',
        background: '#120006',
    },
    red: {
        id: 'red',
        name: 'Vermelho Fogo',
        primary: '#EF4444',
        secondary: '#450A0A',
        background: '#0F0202',
    },
    cyan: {
        id: 'cyan',
        name: 'Turquesa Mar',
        primary: '#06B6D4',
        secondary: '#083344',
        background: '#010B10',
    }
};

export type ThemeId = keyof typeof THEME_PALETTES;
export type ThemeColors = typeof THEME_PALETTES['green'];

interface ThemeState {
    currentThemeId: ThemeId;
    colors: ThemeColors;
    setTheme: (id: ThemeId) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            currentThemeId: 'green',
            colors: THEME_PALETTES['green'],
            setTheme: (id: ThemeId) => {
                const newColors = THEME_PALETTES[id];
                if (newColors) {
                    set({ currentThemeId: id, colors: newColors });
                }
            },
        }),
        {
            name: 'theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
