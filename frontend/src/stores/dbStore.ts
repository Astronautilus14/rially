import { writable } from "svelte/store";
import { readable } from "svelte/store";
import { navigate } from "svelte-routing";
import { isLoading, showError } from "./loadingStore";
import settings from "../lib/settings.json";
// Why not const?
let fetchPlusPlus = (url, method?, body?, shouldReload?) => {
  // Own fetch including isLoading, error handling and returning the promise data
  if (url[0] === "/") url = url.slice(1);

  //   isLoading.set(true);

  return new Promise((resolve, reject) => {
    fetch(`${settings.api_url}/${url}`, {
      headers: {
        "Content-Type": "application/json", // application json content type works on GET as well lol
        Authorization: localStorage.getItem("rially::token"),
      },
      method: method || "GET",
      body: body ? JSON.stringify(body) : undefined,
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401 || res.status === 403) {
          isLoading.set(false);
          reject("Not logged in");
          navigate("/login", { replace: true });
        }

        reject(); // Shouldnt this be removed?
        res.json().then((data) => {
          showError(data.message);
          isLoading.set(false);
          reject(data.message);
        });
      })
      .then((data) => {
        // Resolving data
        resolve(data);
      })
      .catch((e) => reject(e))
      .finally(() => {
        // isloading is weird with finally or smth
        isLoading.set(false);
        if (shouldReload) window.location.reload();
      });
  });
};

export { fetchPlusPlus };
