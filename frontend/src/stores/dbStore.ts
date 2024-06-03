import { navigate } from "svelte-routing";
import { isLoading, showError } from "./loadingStore";
import settings from "../lib/settings.json";
import { getRequestHeaders } from "../lib/getRequestHeaders";

const fetchPlusPlus = (
  url: string,
  method: string = "GET",
  body?: any,
  shouldReload?: boolean
) => {
  // Own fetch including isLoading, error handling and returning the promise data
  if (url[0] === "/") url = url.slice(1);

  return new Promise<any>((resolve, reject) => {
    fetch(`${settings.api_url}/${url}`, {
      headers: getRequestHeaders(),
      method: method,
      body: body ? JSON.stringify(body) : undefined,
    })
      .then(async (res) => {
        if (res.ok) {
          resolve(await res.json());
        } else if (res.status === 401 || res.status === 403) {
          reject("Not logged in");
          navigate("/login", { replace: true });
        } else {
          throw new Error((await res.json()).message);
        }
      })
      .catch((error: any) => {
        console.error(error);
        showError(error.toString());
        reject(error);
      })
      .finally(() => {
        // Set loading store and reload the page if necessary
        isLoading.set(false);
        if (shouldReload) window.location.reload();
      });
  });
};

export { fetchPlusPlus };
