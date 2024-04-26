// reducers/index.js

import { combineReducers } from 'redux';
import hubReducer from './hubReducer';
import onboardingReducer from './onboardingReducer';
const rootReducer = combineReducers({
  hub: hubReducer,
  onboarding: onboardingReducer,
});

export default rootReducer;
