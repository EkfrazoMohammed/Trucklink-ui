import axios from "axios";
const baseURL=`http://localhost:3006`;
const API = axios.create({
  baseURL,
});

export {API,baseURL};
