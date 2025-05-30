import { SET_SIDEBAR_OPEN, SET_DARK_MODE, SET_LANGUAGE } from '../constants';

// Get initial state from localStorage
const initialDarkMode = JSON.parse(localStorage.getItem('darkMode')) || true;
const initialLanguage = localStorage.getItem('language') || 'en';

const initialState = {
  sidebarOpen: false,
  darkMode: initialDarkMode,
  language: initialLanguage,
};

export const uiReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_SIDEBAR_OPEN:
      return {
        ...state,
        sidebarOpen: action.payload,
      };
    case SET_DARK_MODE:
      return {
        ...state,
        darkMode: action.payload,
      };
    case SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      };
    default:
      return state;
  }
};