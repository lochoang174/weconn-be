import { Inject, Injectable } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { BOT_CRUD_SERVICE_NAME, BotCrudServiceClient, FaceDetectRequest, FaceDetectRequestPrivate } from 'proto/bot-crud';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { firstValueFrom } from 'rxjs';
@Injectable()
export class UploadService {
    private botCrudService: BotCrudServiceClient;
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        @Inject(BOT_CRUD_SERVICE_NAME) private clientGrpc: ClientGrpc,
    ) { }

    onModuleInit() {
        this.botCrudService = this.clientGrpc.getService<BotCrudServiceClient>('BotCrudService');
    }
    async uploadAndCropImage(file: Express.Multer.File, folder?: string) {
        const saveImage = await this.cloudinaryService.uploadImage(file, folder)
        console.log(saveImage)
        const request: FaceDetectRequest = {
            url: saveImage.url
        };
        const response = await firstValueFrom(this.botCrudService.detectFacesPublic(request));
        const result = this.cloudinaryService.getCroppedFaceUrls(response.url, response.faces);
        return result

    }
        async uploadAndCropImagePrivate(file: Express.Multer.File,userId: string, folder?: string ) {
        const saveImage = await this.cloudinaryService.uploadImage(file, folder)
        console.log(saveImage)
        const request: FaceDetectRequestPrivate = {
            url: saveImage.url, 
            userId:userId
        };
        const response = await firstValueFrom(this.botCrudService.detectFacesPrivate(request));
        console.log(response)
        const result = this.cloudinaryService.getCroppedFaceUrls(response.url, response.faces);
        return result

    }
}
