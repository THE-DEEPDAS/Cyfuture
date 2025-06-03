import { createStore, combineReducers, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import { composeWithDevTools } from "@redux-devtools/extension";

// Import reducers
import { analyticsReducer } from "./reducers/analyticsReducer";
import { messageReducer } from "./reducers/messageReducer";
import { messagesReducer } from "./reducers/messagesReducer";

const reducer = combineReducers({
  analytics: analyticsReducer,
  message: messageReducer,
  messages: messagesReducer,
});

const initialState = {};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;
