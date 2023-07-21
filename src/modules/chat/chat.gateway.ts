import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';

interface UserMessages {
  socketId: string;
  postedMessagesId: string[];
}

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  users: { [key: string]: string } = {};
  userMessages: UserMessages[] = [];

  //conn
  handleConnection(socket: Socket) {
    this.users[socket.id] =
      socket.handshake.query.username?.toString() ||
      `User${Math.floor(Math.random() * 100000)}`;

    const newUser: UserMessages = {
      socketId: socket.id,
      postedMessagesId: [],
    };
    this.userMessages.push(newUser);

    socket.emit('users', Object.values(this.users));
    this.server.emit(
      'message',
      `${this.users[socket.id]} has joined the chat.`,
    );
  }
  //disconn
  handleDisconnect(socket: Socket) {
    const disconnectedUser = this.users[socket.id];
    delete this.users[socket.id];
    const userIndex = this.userMessages.findIndex(
      (user) => user.socketId === socket.id,
    );
    if (userIndex !== -1) {
      this.userMessages.splice(userIndex, 1);
    }
    this.server.emit('message', `${disconnectedUser} has left the chat`);
  }

  //message
  @SubscribeMessage('message')
  handleMessage(socket: Socket, message: { id: string; content: string }) {
    const sender = this.users[socket.id];
    const { id, content } = message;

    this.userMessages.forEach((userMessage) => {
      if (userMessage.socketId === socket.id) {
        userMessage.postedMessagesId.push(id);
      }
    });
    this.server.emit('message', { sender, content });
  }

  //update message
  @SubscribeMessage('updateMessage')
  handleUpdateMessage(
    socket: Socket,
    message: { content: string; id: string },
  ) {
    const { id, content } = message;

    const userIndex = this.userMessages.findIndex(
      (user) => user.socketId === socket.id,
    );
    const messageIndex = this.userMessages[
      userIndex
    ].postedMessagesId.findIndex((messageId) => messageId === id);
    if (messageIndex !== -1) {
      this.server.emit('messageUpdated', { id, content });
    } else socket.emit('messageUpdated', 'error - message not found');
  }

  //delete message
  @SubscribeMessage('deleteMessage')
  handleDeleteMessage(socket: Socket, message: { id: string }) {
    const socketId = socket.id;
    const { id } = message;
    const userIndex = this.userMessages.findIndex(
      (user) => user.socketId === socket.id,
    );
    const messageIndex = this.userMessages[
      userIndex
    ].postedMessagesId.findIndex((messageId) => messageId === id);
    if (messageIndex !== -1) {
      this.userMessages[userIndex].postedMessagesId.splice(messageIndex, 1);
      this.server.emit('messageDeleted', { id, socketId });
    } else socket.emit('messageDeleted', 'error - message not found');
  }
}
