import {
    WebSocketGateway,
    SubscribeMessage,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    WsResponse,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    cors: {
        origin: '*', // Cho phép kết nối từ mọi nguồn
    },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    private server!: Server;

    private readonly logger = new Logger(SocketGateway.name);

    constructor(private readonly socketService: SocketService) {}

    // Sau khi gateway được khởi tạo, gán server instance cho service
    afterInit(server: Server): void {
        this.logger.log('SocketGateway đã khởi tạo.');
        this.socketService.initialize(server);
    }

    // Xử lý khi có client mới kết nối
    handleConnection(client: Socket): void {
        this.logger.log(`Client đã kết nối: ${client.id}`);
    }

    // Xử lý khi có client ngắt kết nối
    handleDisconnect(client: Socket): void {
        // Socket.IO tự động xóa client khỏi tất cả các room khi họ ngắt kết nối.
        // Không cần thêm logic gì ở đây.
        this.logger.log(`Client đã ngắt kết nối: ${client.id}`);
    }

    /**
     * Lắng nghe sự kiện 'registerAdmin' từ client.
     * Khi nhận được, thêm client đó vào admin room.
     */
    @SubscribeMessage('registerAdmin')
    handleRegisterAdmin(
        @ConnectedSocket() client: Socket,
    ): WsResponse<{ message: string }> {
        const adminRoom = this.socketService.ADMIN_ROOM;
        client.join(adminRoom); // Thêm client vào room
        this.logger.log(`Socket ${client.id} đã tham gia vào phòng admin: ${adminRoom}`);

        // Gửi lại phản hồi cho client để xác nhận đã vào room thành công
        return { 
            event: 'adminRegistered', 
            data: { message: `Đã tham gia thành công phòng: ${adminRoom}` } 
        };
    }
}