import { writable } from "svelte/store";
import { toast } from "@zerodevx/svelte-toast";

let isLoading = writable(false);

let showError = (message: string) => {
  toast.push(message, {
    duration: 10000,
    theme: {
      "--toastBackground": "#cc0a74",
      "--toastColor": "white",
      "--toastBarBackground": "white",
    },
  });
};

export { isLoading, showError };
