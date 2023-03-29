import { writable } from "svelte/store";
import { readable } from "svelte/store";

let isLoggedIn = writable(!!localStorage.getItem("rially::token"));

export { isLoggedIn };
