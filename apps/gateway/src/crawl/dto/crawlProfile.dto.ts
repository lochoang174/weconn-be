import { IsString, IsUrl } from "class-validator";

export class CrawlProfileDto {
  @IsString()
  @IsUrl({}, { message: 'url must be a valid URL' })
  url: string;
  @IsString()
  apiKey: string
}
