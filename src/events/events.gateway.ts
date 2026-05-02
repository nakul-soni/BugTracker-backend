import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server: Server;

  emitBugUpdate(bugId: string) {
    this.server.emit('bugUpdated', { bugId });
  }

  emitCommentAdded(bugId: string) {
    this.server.emit('commentAdded', { bugId });
  }
}
