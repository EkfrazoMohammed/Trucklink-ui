import axios from "axios";
const baseURL = `https://trucklinkuatnew.thestorywallcafe.com`;
const API = axios.create({
  baseURL,
});

export { API, baseURL };
