import { writable } from "svelte/store";
import { readable } from "svelte/store";
import settings from "../lib/settings.json";

let isLoggedIn = writable(!!localStorage.getItem("rially::token"));

let verifyToken = async (t?) => {
  if (!t) t = localStorage.getItem("rially::token");
  if (!t) return false;

  return fetch(`${settings.api_url}/auth/verifytoken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: t,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json();
      return Promise.reject(res);
    })
    .then((data) => {
      localStorage.setItem("rially::token", data.token);
      isLoggedIn.set(true);
      return Promise.resolve(data);
    })
    .catch((res) => {
      isLoggedIn.set(false);
      return Promise.reject(res);
    });
};

export { isLoggedIn, verifyToken };
