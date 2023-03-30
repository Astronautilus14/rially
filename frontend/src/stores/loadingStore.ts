import { writable } from "svelte/store";
import { readable } from "svelte/store";

let isLoading = writable(false);

export { isLoading };
