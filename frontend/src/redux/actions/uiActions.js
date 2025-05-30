import { SET_SIDEBAR_OPEN, SET_DARK_MODE, SET_LANGUAGE } from '../constants';

export const setSidebarOpen = (isOpen) => ({
  type: SET_SIDEBAR_OPEN,
  payload: isOpen,
});

export const setDarkMode = (isDarkMode) => {
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  return {
    type: SET_DARK_MODE,
    payload: isDarkMode,
  };
};

export const setLanguage = (language) => {
  localStorage.setItem('language', language);
  return {
    type: SET_LANGUAGE,
    payload: language,
  };
};