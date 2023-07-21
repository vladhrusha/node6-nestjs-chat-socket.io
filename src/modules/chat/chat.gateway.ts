import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserChatHistory, ConnectedUsers } from './chat.interface';

@WebSocketGateway()
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  connectedUsers: ConnectedUsers = {};
  userChatHistory: UserChatHistory = {};
  //conn
  clientConnected = false;
  handleConnection(socket: Socket) {
    //handle client connection
    if (this.clientConnected === false) {
      this.clientConnected = true;
      return;
    }

    this.connectedUsers[socket.id] =
      socket.handshake.query.username?.toString() ||
      `User${Math.floor(Math.random() * 100000)}`;
    this.userChatHistory[socket.id] = {};
    socket.emit('users', Object.values(this.connectedUsers));
    this.server.emit(
      'message',
      `${this.connectedUsers[socket.id]} has joined the chat`,
    );
  }
  //disconn
  handleDisconnect(socket: Socket) {
    const disconnectedUser = this.connectedUsers[socket.id];
    delete this.connectedUsers[socket.id];
    delete this.userChatHistory[socket.id];

    this.server.emit('message', `${disconnectedUser} has left the chat`);
  }

  //message
  @SubscribeMessage('message')
  handleMessage(socket: Socket, message: { id: string; content: string }) {
    const username = this.connectedUsers[socket.id];
    this.userChatHistory[socket.id][message.id] = message.content;
    this.server.emit('message', {
      username,
      content: message.content,
      messageId: message.id,
    });
  }

  //update message
  @SubscribeMessage('updateMessage')
  handleUpdateMessage(
    socket: Socket,
    message: { content: string; id: string },
  ) {
    if (this.userChatHistory[socket.id][message.id]) {
      this.userChatHistory[socket.id][message.id] = message.content;
      this.server.emit('messageUpdated', {
        messageId: message.id,
        content: message.content,
      });
    } else {
      socket.emit('messageUpdated', 'error - message not found');
    }
  }

  //delete message
  @SubscribeMessage('deleteMessage')
  handleDeleteMessage(socket: Socket, message: { id: string }) {
    if (this.userChatHistory[socket.id][message.id]) {
      delete this.userChatHistory[socket.id][message.id];
      this.server.emit('messageDeleted', {
        messageId: message.id,
      });
    } else {
      socket.emit('messageDeleted', 'error - message not found');
    }
  }
}
