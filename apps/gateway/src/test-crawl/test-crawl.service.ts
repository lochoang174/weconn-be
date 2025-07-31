import { Inject, Injectable } from '@nestjs/common';
import { CrawlListProfileDto } from './dto/crawlList.dto';
import { BOT_CRUD_SERVICE_NAME, BotCrudServiceClient } from 'proto/bot-crud';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CrawlRepository } from './crawl.repository';

@Injectable()
export class TestCrawlService {
  private botCrudService: BotCrudServiceClient;
  constructor(
    @Inject(BOT_CRUD_SERVICE_NAME) private clientGrpc: ClientGrpc,
    private readonly crawlRepository: CrawlRepository,
  ) {}

  async onModuleInit() {
    this.botCrudService =
      this.clientGrpc.getService<BotCrudServiceClient>('BotCrudService');
    let total = await this.crawlRepository.getUrlsNotCompleted();
    console.log(total);
  }
  async getListProfile(payload: CrawlListProfileDto) {
    try {
      const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/google-profiles`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
          'x-rapidapi-key': `${payload.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: payload.name,
          company: payload.company,
          job_title: '',
          location: 'VietNam',
          keyword: payload.keyword,
          page: payload.page,
        }),
      });

      if (!response.ok) {
        // Ném lỗi nếu không fetch được danh sách ban đầu
        throw new Error(
          `Failed to fetch initial list! Status: ${response.status}`,
        );
      }

      const data = await response.json();
      // Gán một mảng rỗng nếu API không trả về data để tránh lỗi
      const listProfile = data?.data || [];
      const totalProfiles = listProfile.length;

      console.log(`Found ${totalProfiles} profiles to process.`);

      const results = [];
      for (const profile of listProfile) {
        try {
          const res = await firstValueFrom(
            this.botCrudService.checkUrlExists({ url: profile }),
          );
          if (res.exists) {
            console.log(`Url: ${profile} already exists. Skipping.`);
            continue;
          }
          const result = await this.crawlSingleprofile(profile, payload.apiKey);
          // Chỉ thêm vào kết quả nếu crawl thành công
          if (result) {
            results.push(result);
          }
        } catch (profileError) {
          console.error(
            `Error processing profile: ${profile}`,
            profileError.message,
          );

          // --- THAY ĐỔI QUAN TRỌNG ---
          // 1. Kiểm tra nếu lỗi là 429 (Rate Limit)
          if (profileError.message && profileError.message.includes('429')) {
            console.log(
              'Rate limit (429) reached. Stopping the crawl process.',
            );
            // 2. Thoát khỏi vòng lặp ngay lập tức
            break;
          }
          // Đối với các lỗi khác, vòng lặp sẽ tiếp tục với profile tiếp theo
        }
      }

      console.log(
        `Finished crawling. Successfully processed ${results.length}/${totalProfiles} profiles.`,
      );

      // --- THAY ĐỔI QUAN TRỌNG ---
      // 3. Trả về kết quả dưới dạng object thống kê
      return {
        message: `Crawled ${results.length} of ${totalProfiles} total profiles.`,
        crawledCount: results.length,
        totalCount: totalProfiles,
        data: results,
      };
    } catch (error) {
      console.error('A critical error occurred in getListProfile:', error);
      // Trả về cấu trúc lỗi thống nhất
      return {
        message: `Critical error: ${error.message}`,
        crawledCount: 0,
        totalCount: 0,
        data: [],
      };
    }
  }

  async crawlSingleprofile(profileUrl: string, apiKey: string) {
    try {
      const encodedUrl = encodeURIComponent(profileUrl);
      const options = {
        method: 'Get',
        headers: {
          'x-rapidapi-host': 'fresh-linkedin-profile-data.p.rapidapi.com',
          'x-rapidapi-key': `${apiKey}`,
          'Content-Type': 'application/json',
        },
      };

      // if ((await this.crawlRepository.checkExist(profileUrl)) === false) {
      //   console.log('Đã có profile này trong database');
      //   return null;
      // }

      const url = `https://fresh-linkedin-profile-data.p.rapidapi.com/get-linkedin-profile?linkedin_url=${profileUrl}`;
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log('Response Headers:');
      response.headers.forEach((value, name) => {
        console.log(`${name}: ${value}`);
      });

      const data = await response.json();

      // Thêm try-catch cho việc transform data
      let result;
      try {
        result = this.transformLinkedInData(data);
        console.log(result);

        const res = await firstValueFrom(
          this.botCrudService.saveVector(result),
        );
        console.log('New document was created has the id is: ');
        console.log(res.id);
      } catch (transformError) {
        console.error('Error transforming LinkedIn data:', transformError);
        // console.error('Raw data received:', JSON.stringify(data, null, 2));
        throw new Error(
          `Data transformation failed: ${transformError.message}`,
        );
      }

      // Thêm try-catch cho việc tạo profile trong database
      let crawlProfile;
      try {
        console.log('Profile created successfully');
      } catch (createError) {
        console.error('Error creating profile in database:', createError);
        // console.error('Profile data that failed to save:', JSON.stringify(result, null, 2));
        throw new Error(`Database creation failed: ${createError.message}`);
      }

      return crawlProfile;
    } catch (error) {
      console.error('Error fetching LinkedIn profile data:', error);
      console.error('Profile URL:', profileUrl);
    }
  }

  transformLinkedInData(raw: any): TransformedLinkedInProfile {
    const data = raw?.data;

    return {
      url: data?.linkedin_url ?? '',
      name: data?.full_name ?? '',
      picture: data?.profile_image_url ?? '',
      headline: data?.headline ?? '',
      location: data?.location ?? '',
      current_company: data?.company ?? '',
      education: data?.educations?.[0]?.school ?? '', // lấy trường đầu tiên nếu có
    };
  }

  transformSaucurlData(raw: any): TransformedLinkedInProfile {
    const data = raw?.data;
    const basicInfo = data?.basic_info;
    const experience = data?.experience;
    const education = data?.education;

    return {
      url: `https://www.linkedin.com/in/${basicInfo?.public_identifier || ''}`,
      name: basicInfo?.fullname || '',
      picture: basicInfo?.profile_picture_url || '',
      headline: basicInfo?.headline || '',
      location: basicInfo?.location?.full || '',
      current_company: experience?.[0]?.company || '',
      education: education?.[0]?.school || '',
    };
  }

  async handleAllProfilesWithSaucurl(apiKey: string) {
    try {
      // Lấy danh sách username từ database
      const usernames = await this.crawlRepository.getUrlsNotCompleted();
      console.log(
        `Found ${usernames.length} profiles to process with Saucurl API`,
      );

      const results = [];

      for (const username of usernames) {
        try {
          console.log(`Processing username: ${username}`);

          const url = `https://linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com/profile/detail?username=${username}`;
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-host':
                'linkedin-scraper-api-real-time-fast-affordable.p.rapidapi.com',
              'x-rapidapi-key': apiKey,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            console.error(
              `Failed to fetch profile for ${username}. Status: ${response.status}`,
            );
            continue;
          }

          // In ra rate limit remaining
          const rateLimitRemaining = response.headers.get(
            'x-ratelimit-requests-remaining',
          );
          console.log(
            `Rate limit remaining for ${username}: ${rateLimitRemaining}`,
          );

          const data = await response.json();

          // Transform data thành TransformedLinkedInProfile format
          const result = this.transformSaucurlData(data);
          console.log(`Transformed profile data for ${username}:`, result);

          try {
            const res = await firstValueFrom(
              this.botCrudService.saveVector({
                url: result.url,
                name: result.name,
                picture: result.picture,
                headline: result.headline,
                location: result.location,
                currentCompany: result.current_company,
                education: result.education,
              }),
            );

            console.log(`New document was created with id: ${res.id}`);

            // Cập nhật status thành completed
            await this.crawlRepository.updateUrlStatus(
              `https://www.linkedin.com/in/${username}`,
              'completed',
            );
            console.log(
              `Updated status to completed for username: ${username}`,
            );

            results.push({
              username: username,
              originalData: data,
              transformedData: result,
              documentId: res.id,
              status: 'completed',
            });
          } catch (saveError) {
            console.error(
              `Failed to save vector for ${username}:`,
              saveError.message,
            );

            // Cập nhật status thành failed
            await this.crawlRepository.updateUrlStatus(
              `https://www.linkedin.com/in/${username}`,
              'failed',
            );
            console.log(`Updated status to failed for username: ${username}`);

            results.push({
              username: username,
              originalData: data,
              transformedData: result,
              status: 'failed',
              error: saveError.message,
            });
          }
        } catch (error) {
          console.error(
            `Error processing username ${username}:`,
            error.message,
          );
          // Tiếp tục với username tiếp theo
        }
      }

      console.log(
        `Finished processing ${results.length}/${usernames.length} profiles with Saucurl API`,
      );
      return {
        message: `Processed ${results.length} of ${usernames.length} profiles with Saucurl API`,
        processedCount: results.length,
        totalCount: usernames.length,
        data: results,
      };
    } catch (error) {
      console.error('Critical error in handleAllProfilesWithSaucurl:', error);
      return {
        message: `Critical error: ${error.message}`,
        processedCount: 0,
        totalCount: 0,
        data: [],
      };
    }
  }
}
type TransformedLinkedInProfile = {
  url: string;
  name: string;
  picture: string;
  headline?: string;
  location?: string;
  current_company?: string;
  education?: string;
};
