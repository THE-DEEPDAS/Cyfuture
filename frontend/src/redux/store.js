import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Reducers
import { authReducer } from './reducers/authReducer';
import { jobReducer, jobDetailsReducer, employerJobsReducer, topJobsReducer } from './reducers/jobReducer';
import { applicationReducer, jobApplicationsReducer, userApplicationsReducer } from './reducers/applicationReducer';
import { resumeReducer } from './reducers/resumeReducer';
import { chatReducer } from './reducers/chatReducer';
import { analyticsReducer } from './reducers/analyticsReducer';
import { uiReducer } from './reducers/uiReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  jobs: jobReducer,
  jobDetails: jobDetailsReducer,
  employerJobs: employerJobsReducer,
  topJobs: topJobsReducer,
  applications: applicationReducer,
  jobApplications: jobApplicationsReducer,
  userApplications: userApplicationsReducer,
  resume: resumeReducer,
  chat: chatReducer,
  analytics: analyticsReducer,
  ui: uiReducer,
});

// Load user from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  auth: {
    userInfo: userInfoFromStorage,
    isAuthenticated: !!userInfoFromStorage,
    loading: false,
    error: null,
  },
};

const middleware = [thunk];

const store = createStore(
  rootReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;