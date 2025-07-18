
import { IsString, IsUrl, IsOptional } from "class-validator";

export class CreateBotDto {
  @IsString()
  bot_id: string;

  @IsOptional()
  @IsUrl()
  cookie_url?: string; // dấu ? để tránh lỗi khi chưa có trong form ban đầu
}
