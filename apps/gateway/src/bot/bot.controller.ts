import { Body, Controller, Get, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BotService } from './bot.service';
import { CreateBotDto } from './dto/create-bot.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('bot')
export class BotController {
  constructor(private readonly botService: BotService,
    private readonly cloudinaryService: CloudinaryService

  ) { }
  @Post("/")
  @UseInterceptors(FileInterceptor('file'))
  async createBot(
  @UploadedFile() file: Express.Multer.File,
  @Body() createBotDto: CreateBotDto) {
    const result = await this.cloudinaryService.uploadJsonFile(
      file,
      "cookie",

    );
    createBotDto.cookie_url=result.viewUrl
    const saveBot = await this.botService.createBot(createBotDto)
    return saveBot
  }

  @Get("/:id")
  async getBotById() {

  }

  @Get("/")
  async getAllBot() {

  }

  @Put("/")
  async updateAllCookieUrl() {

  }

  @Put("/:id")
  async updateCookieUrlById() {

  }
}
