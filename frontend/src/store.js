import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Reducers
import {
  userLoginReducer,
  userRegisterReducer,
  userDetailsReducer,
  userUpdateProfileReducer,
} from './reducers/userReducers';
import {
  jobListReducer,
  jobDetailsReducer,
  jobCreateReducer,
  jobUpdateReducer,
  jobDeleteReducer,
} from './reducers/jobReducers';
import {
  resumeUploadReducer,
  resumeDetailsReducer,
  resumeChatbotResponseReducer,
} from './reducers/resumeReducers';
import {
  messageCreateReducer,
  messageListReducer,
  resumeMessagesReducer,
} from './reducers/messageReducers';
import {
  adminDashboardReducer,
  adminJobsReducer,
  adminCompanyProfileUpdateReducer,
} from './reducers/adminReducers';

const reducer = combineReducers({
  userLogin: userLoginReducer,
  userRegister: userRegisterReducer,
  userDetails: userDetailsReducer,
  userUpdateProfile: userUpdateProfileReducer,
  
  jobList: jobListReducer,
  jobDetails: jobDetailsReducer,
  jobCreate: jobCreateReducer,
  jobUpdate: jobUpdateReducer,
  jobDelete: jobDeleteReducer,
  
  resumeUpload: resumeUploadReducer,
  resumeDetails: resumeDetailsReducer,
  resumeChatbotResponse: resumeChatbotResponseReducer,
  
  messageCreate: messageCreateReducer,
  messageList: messageListReducer,
  resumeMessages: resumeMessagesReducer,
  
  adminDashboard: adminDashboardReducer,
  adminJobs: adminJobsReducer,
  adminCompanyProfileUpdate: adminCompanyProfileUpdateReducer,
});

// Load userInfo from localStorage
const userInfoFromStorage = localStorage.getItem('userInfo')
  ? JSON.parse(localStorage.getItem('userInfo'))
  : null;

const initialState = {
  userLogin: { userInfo: userInfoFromStorage },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;