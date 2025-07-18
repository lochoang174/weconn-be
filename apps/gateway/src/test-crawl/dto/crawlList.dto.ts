import { IsNumber, IsString, IsUrl } from "class-validator";

export class CrawlListProfileDto {
    @IsString()
    name: string;
    @IsString()
    apiKey: string;

    @IsString()
    company: string;
    @IsNumber()
    page: number;

}
