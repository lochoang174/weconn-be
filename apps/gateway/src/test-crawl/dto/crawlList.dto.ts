import { IsNumber, IsString, IsUrl } from "class-validator";

export class CrawlListProfileDto {
    @IsString()
    name: string;
    @IsString()
    apiKey: string;

    @IsString()
    company: string;
        @IsString()
    keyword: string;
    @IsNumber()
    page: number;

}
