import React, { createContext, useContext, useState, useEffect } from 'react';
import { dataService } from '../services/dataService';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark-olive');
  const [accentColor, setAccentColor] = useState('#C8DEA0');
  const [cardRadius, setCardRadius] = useState('medium');
  const [density, setDensity] = useState('comfortable');
  const [animationEnabled, setAnimationEnabled] = useState(true);

  // Load saved preferences on initial mount
  useEffect(() => {
    async function load() {
      const prefs = await dataService.getPreferences();
      if (prefs) {
        if (prefs.theme) setTheme(prefs.theme);
        if (prefs.accent_color) setAccentColor(prefs.accent_color);
        if (prefs.card_radius) setCardRadius(prefs.card_radius);
        if (prefs.density) setDensity(prefs.density);
        if (prefs.animation_enabled !== undefined) setAnimationEnabled(prefs.animation_enabled);
      }
    }
    load();
  }, []);

  // Synchronize CSS classes and custom properties to document.body and root
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // Remove previous theme classes
    body.classList.remove('theme-dark-olive', 'theme-light-sage', 'theme-custom-accent');
    body.classList.remove('density-compact', 'density-comfortable', 'density-spacious');
    body.classList.remove('radius-small', 'radius-medium', 'radius-large');

    // Add current classes
    body.classList.add(`theme-${theme}`);
    body.classList.add(`density-${density}`);
    body.classList.add(`radius-${cardRadius}`);

    // Update dynamic accent color variable
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--accent-color-glow', `${accentColor}33`); // 20% alpha
  }, [theme, accentColor, cardRadius, density, animationEnabled]);

  const updateTheme = async (newTheme) => {
    setTheme(newTheme);
    await dataService.savePreferences({ theme: newTheme });
  };

  const updateAccentColor = async (color) => {
    setAccentColor(color);
    await dataService.savePreferences({ accent_color: color });
  };

  const updateCardRadius = async (radius) => {
    setCardRadius(radius);
    await dataService.savePreferences({ card_radius: radius });
  };

  const updateDensity = async (newDensity) => {
    setDensity(newDensity);
    await dataService.savePreferences({ density: newDensity });
  };

  const updateAnimationEnabled = async (enabled) => {
    setAnimationEnabled(enabled);
    await dataService.savePreferences({ animation_enabled: enabled });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        accentColor,
        cardRadius,
        density,
        animationEnabled,
        updateTheme,
        updateAccentColor,
        updateCardRadius,
        updateDensity,
        updateAnimationEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
}
