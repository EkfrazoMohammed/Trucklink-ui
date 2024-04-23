// actions.js
import axios from "axios"
export const setSelectedHub = (hub) => ({
    type: 'SET_SELECTED_HUB',
    payload: hub,
  });

  export const fetchOnboardingData = () => {
    return (dispatch) => {
      axios.get("http://localhost:3006/owner")
        .then((res) => {
          console.log(res)
          if (res.status === 200) {
            dispatch({ type: 'FETCH_ONBOARDING_DATA_SUCCESS', payload: res.data });
          }
        })
        .catch((err) => {
          console.log(err)
          dispatch({ type: 'FETCH_ONBOARDING_DATA_ERROR', payload: err });
        });
    };
  };