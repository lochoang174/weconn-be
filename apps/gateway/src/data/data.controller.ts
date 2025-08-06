import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { DataService } from './data.service';
import { IS_PUBLIC_KEY, Public } from '../decorator/customize';

@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}
    @Get()
    @Public()
  async getPaginatedData(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
  ) {
    return await  this.dataService.getData(page, pageSize);
  }
  @Delete("/delete")
      @Public()
  async removeItem(@Body() data : {data:string[]}){
    return await this.dataService.removeListItem(data.data)
  }
}
