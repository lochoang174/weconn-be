import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
    private server: Server | null = null;
    private readonly logger = new Logger(SocketService.name);
    
    // Tên của room dành cho admin
    public readonly ADMIN_ROOM = 'admins_room';

    constructor() { }

    /**
     * Khởi tạo server instance từ Gateway.
     */
    initialize(server: Server): void {
        this.server = server;
        this.logger.log('Socket.io server initialized in SocketService');
    }

    /**
     * Gửi một sự kiện đến tất cả các client trong admin room.
     * Phương thức này sẽ được gọi bởi các service khác trong ứng dụng.
     * @param event - Tên của sự kiện.
     * @param data - Dữ liệu đi kèm.
     */
    emitToAdminRoom(event: string, data: any): void {
        if (!this.server) {
            this.logger.warn('Socket server chưa được khởi tạo. Không thể gửi sự kiện.');
            return;
        }
        this.logger.log(`Đang gửi sự kiện '${event}' tới phòng '${this.ADMIN_ROOM}'`);
        this.server.to(this.ADMIN_ROOM).emit(event, data);
    }
}