import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsResponse, // Optional: For acknowledging messages
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io'; // Import Server and Socket types
import { Logger } from '@nestjs/common';

// Configure CORS as needed, e.g., allow all for development
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  private server!: Server; // Use '!' for definite assignment if afterInit is guaranteed

  private readonly logger = new Logger(SocketGateway.name);

  constructor(private readonly socketService: SocketService) {}

  // Lifecycle hook: pass server instance to service after NestJS initializes it
  afterInit(server: Server): void {
    this.logger.log('SocketGateway initialized and server is available.');
    this.socketService.initialize(server); // Pass server to service
  }

  handleConnection(client: Socket, ...args: any[]): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.log(`Client disconnected: ${client.id}`);
    await this.socketService.unregisterUserSocket(client.id);
  }

  /**
   * Handles client registration.
   * Payload should contain `userId`.
   */
  @SubscribeMessage('registerGuest')
  async handleRegisterGuest(
    @MessageBody() data: { userId: string,eventName: string },
    @ConnectedSocket() client: Socket,
  ): Promise<WsResponse<any>> { // Return type for acknowledgment
    const { userId } = data;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      this.logger.warn(
        `Registration attempt from socket ${client.id} with invalid userId: ${userId}`,
      );
      return { event: 'registrationError', data: { message: 'Valid userId is required.' } };
    }

    this.logger.log(
      `Attempting to register guest: userId '${userId}', socketId '${client.id}'`,
    );
    await this.socketService.registerUserSocket(userId, client.id, data.eventName);
    
    // Acknowledge successful registration to the client
    return { event: 'registeredSuccessfully', data: { userId, socketId: client.id, message: 'Registration successful. Awaiting response.' } };
  }

  /**
   * This function is for the gateway to emit the `guest_response`.
   * It will be called by the SocketService when a direct emission is needed
   * or if the microservice handler triggers it through the service.
   * (This specific function might not be called directly if `attemptEmitToUser` in service handles all)
   */
  public emitGuestResponseToUser(userId: string, responseData: any): void {
  
    this.logger.log(`Gateway explicitly asked to emit 'guest_response' for userId '${userId}'`);
    this.socketService.attemptEmitToUser(userId, 'guest_response', responseData);
  }
}