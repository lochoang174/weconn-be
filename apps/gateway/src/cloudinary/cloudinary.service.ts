import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from "streamifier";
import { v4 as uuidv4 } from 'uuid';

export interface CloudinaryUploadResult {
  userId?: string,
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  created_at: string;
}

// Interface cho tọa độ khuôn mặt (để code rõ ràng hơn)
export interface FaceCoordinates {
  x: number;
  y: number;
  width: number;
  height: number;
    historyDetailId?: string
}


@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(
    private readonly configService: ConfigService,
    @Inject("IMAGE")
    private client: ClientProxy
  ) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('Cloudinary configured successfully');
  }

  async uploadImage(
    file: Express.Multer.File,
    folder?: string,
    transformation?: any,
  ): Promise<CloudinaryUploadResult> {
    try {
      if (!this.isValidImageType(file.mimetype)) {
        throw new BadRequestException(
          'Invalid file type. Only images are allowed.',
        );
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new BadRequestException(
          'File size too large. Maximum 10MB allowed.',
        );
      }
      const uploadOptions: any = {
        resource_type: 'image',
        folder: folder || 'uploads',
        use_filename: true,
        unique_filename: true,
      };
      if (transformation) {
        uploadOptions.transformation = transformation;
      }
      const cloudinaryUploadPromise: Promise<CloudinaryUploadResult> = new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: UploadApiErrorResponse, result: UploadApiResponse) => {
              if (error) {
                this.logger.error('Cloudinary upload error:', error);
                reject(
                  new BadRequestException(`Upload failed: ${error.message}`),
                );
              } else {
                this.logger.log(
                  `Image uploaded successfully: ${result.public_id}`,
                );
                const uploadResult: CloudinaryUploadResult = {
                  public_id: result.public_id,
                  url: result.url,
                  secure_url: result.secure_url,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                  bytes: result.bytes,
                  created_at: result.created_at,
                };
                resolve(uploadResult);
              }
            },
          );
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );
      const uploadedImageResult = await cloudinaryUploadPromise;
      const generatedUuid = uuidv4();


      return {
        ...uploadedImageResult,
        userId: generatedUuid
      };
    } catch (error) {
      this.logger.error('Error in uploadImage process:', error);
      throw error;
    }
  }
  async uploadJsonFile(
    file: Express.Multer.File,
    folder?: string,
  ): Promise<CloudinaryUploadResult & { userId: string; viewUrl: string }> {
    try {
      // 1. Kiểm tra định dạng
      if (file.mimetype !== 'application/json') {
        throw new BadRequestException(
          'Invalid file type. Only JSON files are allowed.',
        );
      }

      const maxSize = 2 * 1024 * 1024; // Giới hạn 2MB
      if (file.size > maxSize) {
        throw new BadRequestException('File size too large. Maximum 2MB allowed.');
      }

      // 2. Cấu hình upload
      const uploadOptions: any = {
        resource_type: 'raw',
        folder: folder || 'json-uploads',
        use_filename: true,
        unique_filename: false, // Giữ tên gốc
        filename_override: file.originalname, // Đảm bảo giữ lại đuôi .json
      };

      // 3. Upload lên Cloudinary
      const cloudinaryUploadPromise: Promise<CloudinaryUploadResult> = new Promise(
        (resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error: UploadApiErrorResponse, result: UploadApiResponse) => {
              if (error) {
                this.logger.error('Cloudinary JSON upload error:', error);
                reject(
                  new BadRequestException(`JSON Upload failed: ${error.message}`),
                );
              } else {
                this.logger.log(`JSON uploaded successfully: ${result.public_id}`);
                const uploadResult: CloudinaryUploadResult = {
                  public_id: result.public_id,
                  url: result.url,
                  secure_url: result.secure_url,
                  format: result.format,
                  width: result.width,
                  height: result.height,
                  bytes: result.bytes,
                  created_at: result.created_at,
                };
                resolve(uploadResult);
              }
            },
          );

          // Dùng streamifier để tạo stream từ buffer
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        },
      );

      const uploadedJsonResult = await cloudinaryUploadPromise;
      const generatedUuid = uuidv4();

      // 4. Tạo viewUrl để xem trực tiếp JSON (tránh tải về)
      const viewUrl = uploadedJsonResult.secure_url.replace(
        '/upload/',
        '/upload/fl_attachment:false/'
      );

      // 5. Emit event nếu cần
      try {
        if (this.client) {
          this.client.emit('json_uploaded', {
            url: viewUrl,
            downloadUrl: uploadedJsonResult.secure_url,
            id: generatedUuid,
            public_id: uploadedJsonResult.public_id,
          });
          this.logger.log(`Emitted "json_uploaded" event for URL: ${viewUrl}`);
        } else {
          this.logger.warn('ClientProxy not available. Cannot emit "json_uploaded" event.');
        }
      } catch (emitError) {
        this.logger.error('Error emitting "json_uploaded" event:', emitError);
      }

      // 6. Trả về kết quả
      return {
        ...uploadedJsonResult,
        userId: generatedUuid,
        viewUrl: viewUrl,
      };
    } catch (error) {
      this.logger.error('Error in uploadJsonFile process:', error);
      throw error;
    }
  }

  /**
   * Upload multiple images to Cloudinary
   */
  async uploadMultipleImages(
    files: Express.Multer.File[],
    folder?: string,
    transformation?: any
  ): Promise<CloudinaryUploadResult[]> {
    try {
      const uploadPromises = files.map(file =>
        this.uploadImage(file, folder, transformation)
      );
      const results = await Promise.all(uploadPromises);
      this.logger.log(`Successfully uploaded ${results.length} images`);
      return results;
    } catch (error) {
      this.logger.error('Error uploading multiple images:', error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      if (result.result === 'ok') {
        this.logger.log(`Image deleted successfully: ${publicId}`);
        return true;
      } else {
        this.logger.warn(`Failed to delete image: ${publicId}`);
        return false;
      }
    } catch (error) {
      this.logger.error('Error deleting from Cloudinary:', error);
      throw new BadRequestException(`Delete failed: ${error.message}`);
    }
  }


  /**
   * Generate optimized URL with transformations
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string; // 'crop', 'fill', 'scale', etc.
      x?: number;    // Cần thiết cho crop='crop'
      y?: number;    // Cần thiết cho crop='crop'
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    try {
      return cloudinary.url(publicId, {
        ...options,
        secure: true, // Luôn dùng HTTPS
      });
    } catch (error) {
      this.logger.error('Error generating optimized URL:', error);
      throw new BadRequestException(`Failed to generate optimized URL: ${error.message}`);
    }
  }

  /**
   * NEW FUNCTION: Generate URLs for cropped faces based on coordinates
   */
  public extractPublicIdFromUrl(imageUrl: string): string | null {
    try {
      const url = new URL(imageUrl);
      // Typical Cloudinary path: /<cloud_name>/<resource_type>/<type>/<version>/<public_id_path>.<format>
      // Or without cloud_name if using CNAME: /<resource_type>/<type>/<version>/<public_id_path>.<format>
      // We are interested in the part after <resource_type>/<type>/ and after the optional <version>.
      const pathSegments = url.pathname.split('/');

      let uploadMarkerIndex = -1;
      // Find the 'upload' segment, common for 'image/upload', 'video/upload' etc.
      for (let i = 0; i < pathSegments.length - 1; i++) {
        if (pathSegments[i + 1] === 'upload' && (pathSegments[i] === 'image' || pathSegments[i] === 'video' || pathSegments[i] === 'raw' || pathSegments[i] === this.configService.get<string>('CLOUDINARY_CLOUD_NAME'))) {
          // Check if pathSegments[i] is the cloud_name if it's directly after root
          if (i === 1 && pathSegments[i] === this.configService.get<string>('CLOUDINARY_CLOUD_NAME')) {
            // e.g. /<cloud_name>/image/upload/...
            if (pathSegments.length > i + 3 && (pathSegments[i + 1] === 'image' || pathSegments[i + 1] === 'video' || pathSegments[i + 1] === 'raw') && pathSegments[i + 2] === 'upload') {
              uploadMarkerIndex = i + 2; // 'upload' is at i+2
              break;
            }
          } else if (pathSegments[i] === 'image' || pathSegments[i] === 'video' || pathSegments[i] === 'raw') {
            // e.g. /image/upload/... (CNAME or cloud_name not first segment)
            uploadMarkerIndex = i + 1; // 'upload' is at i+1
            break;
          }
        }
      }

      if (uploadMarkerIndex === -1) {
        // Fallback: try to find 'upload' and assume segments after it are relevant
        const genericUploadIndex = pathSegments.lastIndexOf('upload');
        if (genericUploadIndex !== -1) {
          uploadMarkerIndex = genericUploadIndex;
        } else {
          this.logger.warn(`Could not find 'upload' segment in URL path: ${url.pathname} for URL ${imageUrl}`);
          return null;
        }
      }

      // Segments after 'upload'
      let idSegments = pathSegments.slice(uploadMarkerIndex + 1);

      // Remove version if it exists (e.g., v1234567890)
      if (idSegments.length > 0 && /^v\d+$/.test(idSegments[0])) {
        idSegments.shift();
      }

      if (idSegments.length === 0) {
        this.logger.warn(`No public_id segments found after 'upload' (and optional version) in URL path: ${url.pathname} for URL ${imageUrl}`);
        return null;
      }

      const publicIdWithExtension = idSegments.join('/');
      const lastDotIndex = publicIdWithExtension.lastIndexOf('.');

      let extractedPublicId: string;
      if (lastDotIndex === -1) {
        // No extension, assume the whole part is the public_id
        extractedPublicId = publicIdWithExtension;
      } else {
        extractedPublicId = publicIdWithExtension.substring(0, lastDotIndex);
      }

      if (!extractedPublicId) { // Double check if it became empty
        this.logger.warn(`Extracted public_id is empty for URL ${imageUrl}`);
        return null;
      }

      this.logger.log(`Extracted public_id: ${extractedPublicId} from ${imageUrl}`);
      return extractedPublicId;

    } catch (error) {
      this.logger.error(`Error parsing URL or extracting public_id from "${imageUrl}": ${error.message}`);
      return null; // Or rethrow if this failure should halt operations
    }
  }
  getCroppedFaceUrls(
    originalImageUrl: string, // URL đầy đủ của ảnh gốc
    faces: FaceCoordinates[],

  ): any[] {
    let publicIdToUse: string | null = this.extractPublicIdFromUrl(originalImageUrl); // Khai báo biến ở đây
    console.log("publicIdToUse: " + faces)

    if (!publicIdToUse) {
      this.logger.error('Original image public_id is required to generate cropped URLs.');
      throw new BadRequestException('Original image public_id is required.');
    }
    if (!faces || faces.length === 0) {
      this.logger.warn('No faces provided to crop.');
      return [];
    }
    this.logger.log(`Generating cropped URLs for public_id: ${publicIdToUse}`);

    const croppedImageUrls: any[] = [];
    for (const face of faces) {
      if (face.width <= 0 || face.height <= 0) {
        this.logger.warn(`Skipping face with invalid dimensions: w=${face.width}, h=${face.height}`);
        continue;
      }
      const cropOptions = {
        width: face.width,
        height: face.height,
        x: face.x,
        y: face.y,
        crop: 'crop' as const, // 'crop' để cắt chính xác theo tọa độ và kích thước
      };

      try {
        // Sử dụng getOptimizedUrl đã có để tạo URL
        const croppedUrl = {
          url: this.getOptimizedUrl(publicIdToUse, cropOptions),
          ...(face.historyDetailId && { history_detail_id: face.historyDetailId  })
        }


        croppedImageUrls.push(croppedUrl);

        this.logger.log(`Generated cropped URL for face (x:${face.x}, y:${face.y}, w:${face.width}, h:${face.height}): ${croppedUrl}`);
      } catch (error) {
        // getOptimizedUrl đã log lỗi và throw BadRequestException
        // Bạn có thể quyết định xử lý thêm ở đây nếu cần, ví dụ: tiếp tục với các khuôn mặt khác
        this.logger.error(`Skipping face due to error generating cropped URL: ${JSON.stringify(face)}`);
        // Nếu muốn dừng toàn bộ quá trình nếu một crop lỗi, hãy ném lại lỗi: throw error;
      }
    }
    return croppedImageUrls;
  }


  // ... (các hàm getImageDetails, listImages, isValidImageType, getAvatarTransformation, getThumbnailTransformation vẫn giữ nguyên)
  /**
   * Upload image from URL
   */

  async getImageDetails(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      this.logger.error('Error getting image details:', error);
      throw new BadRequestException(`Failed to get image details: ${error.message}`);
    }
  }

  /**
   * List images in folder
   */
  async listImages(folder?: string, maxResults: number = 50): Promise<any> {
    try {
      const options: any = {
        type: 'upload',
        max_results: maxResults,
      };

      if (folder) {
        options.prefix = folder;
      }

      const result = await cloudinary.api.resources(options);
      return result;
    } catch (error) {
      this.logger.error('Error listing images:', error);
      throw new BadRequestException(`Failed to list images: ${error.message}`);
    }
  }

  /**
   * Validate image file type
   */
  private isValidImageType(mimetype: string): boolean {
    const validTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    return validTypes.includes(mimetype);
  }





}