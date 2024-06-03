export function getRequestHeaders(): Headers {
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Authorization", localStorage.getItem("rially::token") ?? "");
  return headers;
}
