import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface ThemeColors {
    background: string[]; // For linear gradient
    card: string;
    text: string;
    subText: string;
    accent: string;
    score: string;
    buttonText: string;
    optionBackground: string;
    optionBorder: string;
    optionText: string;
    success: string;
    error: string;
    icon: string;
}

const lightColors: ThemeColors = {
    background: ['#4c669f', '#3b5998', '#192f6a'], // Keep current blue gradient as "light" or maybe this IS the dark one? Actually the current app is quite dark blue.
    // Let's make "Light" mode actually light.
    // Wait, the current app has a dark blue background but white cards. It's kind of a mix.
    // Let's define the CURRENT look as "Light" (or default) for now, but the background is dark.
    // User asked to switch light/dark.
    // Let's make "Light" have a lighter background gradient.
    card: '#ffffff',
    text: '#192f6a',
    subText: '#666666',
    accent: '#3b5998',
    score: '#ffffff',
    buttonText: '#ffffff',
    optionBackground: '#f8f9fa',
    optionBorder: '#e9ecef',
    optionText: '#333333',
    success: '#28a745',
    error: '#dc3545',
    icon: '#192f6a',
};

const darkColors: ThemeColors = {
    background: ['#0f2027', '#203a43', '#2c5364'], // Deep dark gradient
    card: '#1e1e1e',
    text: '#ffffff',
    subText: '#aaaaaa',
    accent: '#4fc3f7',
    score: '#4fc3f7',
    buttonText: '#ffffff',
    optionBackground: '#2c2c2c',
    optionBorder: '#444444',
    optionText: '#eeeeee',
    success: '#66bb6a', // Lighter green for dark mode
    error: '#ef5350', // Lighter red for dark mode
    icon: '#ffffff',
};

// Current app uses: ['#4c669f', '#3b5998', '#192f6a'] for bg. Let's keep that as 'Day' mode although it's dark blue.
// Actually, let's redefine:
// Mode 1 (Default/Blue): Current
// Mode 2 (Dark/Black): New

const defaultColors = lightColors; // Alias for clarity

interface ThemeContextType {
    theme: Theme;
    colors: ThemeColors;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    colors: defaultColors,
    toggleTheme: () => { },
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        loadTheme();
    }, []);

    const loadTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem('app_theme');
            if (savedTheme === 'dark') {
                setTheme('dark');
            }
        } catch (e) {
            console.error('Failed to load theme', e);
        }
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        try {
            await AsyncStorage.setItem('app_theme', newTheme);
        } catch (e) {
            console.error('Failed to save theme', e);
        }
    };

    const colors = theme === 'light' ? lightColors : darkColors;

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
