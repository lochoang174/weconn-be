import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Server } from 'socket.io'; // Import the 'Server' type from socket.io

@Injectable()
export class SocketService {
    private server: Server | null = null; // Instance of socket.io server from WebSocketGateway
    private readonly logger = new Logger(SocketService.name);

    constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

    // Method to be called by SocketGateway to set its server instance
    initialize(server: Server): void {
        this.server = server;
        this.logger.log('Socket.io server initialized in SocketService');
    }

    async registerUserSocket(
        userId: string,
        socketId: string,
        eventName: string, 
    ): Promise<void> {
        const ttl = 3600 * 24; // 24 hours

        await this.cacheManager.set(`RESPONSE_SOCKET_${userId}`, socketId, ttl);
        await this.cacheManager.set(`SOCKET_USER_${socketId}`, userId, ttl);
        this.logger.log(
            `Đã đăng ký (set) mapping cho userId '${userId}' với socketId '${socketId}'`,
        );


        const pendingResponseKey = `${eventName.toUpperCase()}_${userId}`;
        this.logger.log(
            `Đang kiểm tra (get) cache cho key phản hồi đang chờ: '${pendingResponseKey}' cho event '${eventName}'`,
        );
        const pendingResponse = await this.cacheManager.get<any>(
            pendingResponseKey,
        );
        // console.log(pendingResponse) // For debugging the fetched pending response

        if (pendingResponse) {
            this.logger.log(
                `Tìm thấy phản hồi đang chờ cho userId '${userId}' (event: '${eventName}'). Đang gửi đến socketId '${socketId}'.`,
            );
            // Emit the data using the provided eventName
            this.emitDataToSocketId(socketId, eventName, pendingResponse);

            // Sau khi gửi thành công, xóa phản hồi này khỏi cache để không gửi lại
            this.logger.log(
                `Đã gửi xong, đang xóa (del) key '${pendingResponseKey}' khỏi cache.`,
            );
            await this.cacheManager.del(pendingResponseKey);
        } else {
            this.logger.log(
                `Không tìm thấy phản hồi nào đang chờ cho userId '${userId}' với event '${eventName}'.`,
            );
        }
    }

    async unregisterUserSocket(socketId: string): Promise<void> {
        const userId = await this.cacheManager.get<string>(
            `SOCKET_USER_${socketId}`,
        );
        if (userId) {
            await this.cacheManager.del(`RESPONSE_SOCKET_${userId}`);
            this.logger.log(
                `Unregistered socket for userId '${userId}' (from socketId '${socketId}')`,
            );
        }
        await this.cacheManager.del(`SOCKET_USER_${socketId}`);
    }

    /**
     * Attempts to emit data to a user via their registered socket.
     * Returns true if emission was attempted (socketId found), false otherwise.
     */
    async attemptEmitToUser(
        userId: string,
        event: string,
        data: any,
    ): Promise<boolean> {
        if (!this.server) {
            this.logger.warn('Socket server not initialized. Cannot emit.');
            return false;
        }
        const socketId = await this.cacheManager.get<string>(
            `RESPONSE_SOCKET_${userId}`,
        );
        if (socketId) {
            this.logger.log(
                `Emitting event '${event}' to userId '${userId}' (socketId '${socketId}')`,
            );
            this.server.to(socketId).emit(event, data);
            return true; // Emission attempted
        }
        this.logger.log(
            `No active socketId found for userId '${userId}'. Emission for event '${event}' skipped.`,
        );
        return false; // Socket not found
    }

    /**
     * Helper to emit data directly to a specific socketId.
     */
    emitDataToSocketId(socketId: string, event: string, data: any): void {
        if (!this.server) {
            this.logger.warn(
                'Socket server not initialized. Cannot emit directly to socketId.',
            );
            return;
        }
        this.server.to(socketId).emit(event, data);
    }
}