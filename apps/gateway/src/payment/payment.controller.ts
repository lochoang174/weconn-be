import { Body, Controller, Get, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CurrentUser } from '../decorator/customize';
import { PaymentService } from './payment.service';
import { IUser } from '../types/IUser';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService:PaymentService,

  ) { }
  @Post("/")
  async createBot(@CurrentUser() user: IUser) {
    
    return this.paymentService.test(user)
  }

 
}
