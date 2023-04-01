import { writable } from "svelte/store";
import { readable } from "svelte/store";
import { toast } from "@zerodevx/svelte-toast";

let isLoading = writable(false);

let showError = (message) => {
  toast.push(message, {
    duration: 20000,
    theme: {
      "--toastBackground": "#cc0a74",
      "--toastColor": "white",
      "--toastBarBackground": "white",
    },
  });
};

export { isLoading, showError };
