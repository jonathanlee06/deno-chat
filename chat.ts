import {
    WebSocket,
    isWebSocketCloseEvent,
  } from "https://deno.land/std/ws/mod.ts";
  import { v4 } from "https://deno.land/std/uuid/mod.ts";

const users = new Map<string,WebSocket>();

function broadcast(message: string, senderID?: string): void {
    if(!message) return
    for (const user of users.values()) {
        user.send(senderID ? `[${senderID}]: ${message}` : message);
    }
}

export async function chat(ws: WebSocket): Promise<void> {
    const userID = v4.generate();

    // Register user connection
    users.set(userID, ws);
    broadcast(`> User with the id ${userID} is connected`);

    // Wait for new messages
    for await (const event of ws) {
        const message = typeof event === 'string' ? event : ''

        broadcast(message, userID);

        // Unregister user connection
        if (!message && isWebSocketCloseEvent(event)) {
            users.delete(userID);
            broadcast(`> User with the id ${userID} is disconnected`);
            break;
        }
    }
}