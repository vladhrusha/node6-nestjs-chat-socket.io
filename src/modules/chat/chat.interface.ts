export interface ConnectedUsers {
  [socketId: string]: string;
}
export interface UserChatHistory {
  [socketId: string]: {
    [messageId: string]: string;
  };
}
