import { Body, Controller, Post } from '@nestjs/common';
import { ImageSearchService } from './image-search.service';

@Controller('image-search')
export class ImageSearchController {
  constructor(private readonly imageSearchService: ImageSearchService) {}
  @Post("/")
  handleSearch(@Body() data: any){
    return this.imageSearchService.handleSearch(data)

  }
}
