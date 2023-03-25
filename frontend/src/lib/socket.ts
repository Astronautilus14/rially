import settings from "./settings.json";
import { io } from "socket.io-client";

const socket = io(settings.socketServerUrl);

export default socket;
