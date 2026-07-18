import axios from "axios";
import { API_URL } from "../core";
import { attachAuthInterceptor } from "./interceptor";

export const http = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

attachAuthInterceptor(http);
