import Cookies from "universal-cookie";

const cookies = new Cookies();

export default {
  // setter method for get the token
  // read about getter and setter in javascript
  set(authToken = null, options) {
    return cookies.set("authToken", authToken, options);
  },

  setUserData(data) {
    return cookies.set("logData", data);
  },

  // getter method for get the token
  // read about getter and setter in javascript
  get(authToken) {
    const token = cookies.get(authToken) || "";
    return token;
  },

  getUserData() {
    return cookies.get("logData");
  },
  // set auth token once login credentials are validated and
  // service sends you the auth token
  // if not we need to check this
  setAuthToken(authToken, options = {}) {
    return this.set(authToken, options);
  },
  // get user auth token as and when needed
  getAuthToken(authTokenKey = "authToken") {
    return this.get(authTokenKey);
  },
  // call this function on logout and remove the user auth token
  removeToken() {
    return cookies.remove("authToken");
  },
};
