import axios from "axios";
const baseURL = `https://trucklinkuatnew.thestorywallcafe.com/prod/v1/`;
// const baseURL = `http://localhost:3000/prod/v1`
const API = axios.create({
  baseURL,
});

export { API, baseURL };
