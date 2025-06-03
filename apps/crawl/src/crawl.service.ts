import { Inject, Injectable } from '@nestjs/common';
import { Education } from './schemas/education.schema';
import { Experience } from './schemas/experience.schema';
import { LinkedInProfile } from './schemas/linkedin-profile.schema';
import { ProfileCrawl } from './schemas/profile-crawl.schema';
import { CrawlRepository } from './crawl.repository';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class CrawlService {
  constructor(
    private readonly crawlRepository: CrawlRepository,
    @Inject('MAIN') private client: ClientProxy,
  ) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  async createProfileVector(id: number) {
    const profile = await this.crawlRepository.findByProfileId(id);
    if (profile) {
      await this.crawlRepository.updateStatus(
        profile._id.toString(),
        'completed',
      );
      console.log('Profile vector created');
    }
  }

  async crawlSingleprofile(profileUrl: string, apiKey: string) {
    try {
      const encodedUrl = encodeURIComponent(profileUrl);
      const options = {
        method: 'GET',
        headers: {
          'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
          'x-rapidapi-key': `${apiKey}`,
        },
      };
      
      if ((await this.crawlRepository.checkExist(profileUrl)) === false) {
        console.log('Đã có profile này trong database');
        return null;
      }
      
      const url = `https://linkedin-data-api.p.rapidapi.com/get-profile-data-by-url?url=${encodedUrl}`;
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
      let result: ProfileCrawl;
      try {
        result = this.transformLinkedInData(data, profileUrl);
      } catch (transformError) {
        console.error('Error transforming LinkedIn data:', transformError);
        console.error('Raw data received:', JSON.stringify(data, null, 2));
        throw new Error(`Data transformation failed: ${transformError.message}`);
      }

      // Thêm try-catch cho việc tạo profile trong database
      let crawlProfile;
      try {
        crawlProfile = await this.crawlRepository.create(result);
        console.log('Profile created successfully');
        console.log(crawlProfile);
      } catch (createError) {
        console.error('Error creating profile in database:', createError);
        console.error('Profile data that failed to save:', JSON.stringify(result, null, 2));
        throw new Error(`Database creation failed: ${createError.message}`);
      }

      if (crawlProfile) {
        this.client.emit('profile_created', crawlProfile.profile);
      }

      return crawlProfile;
    } catch (error) {
      console.error('Error fetching LinkedIn profile data:', error);
      console.error('Profile URL:', profileUrl);
      throw error;
    }
  }

  transformLinkedInData(rawData: any, urlProcessed: string): ProfileCrawl {
    try {
      // Validate required fields trước khi mapping
      if (!rawData) {
        throw new Error('Raw data is null or undefined');
      }

      // Kiểm tra và provide default values cho các field bắt buộc
      const profile: LinkedInProfile = {
        id: rawData.id || 0,
        username: rawData.username || '',
        name: {
          firstName: rawData.firstName || '',
          lastName: rawData.lastName || '',
        },
        headline: rawData.headline || '',
        profilePicture: rawData.profilePicture || '', // Đảm bảo field này luôn có giá trị
        summary: rawData.summary || '',
        location: {
          city: rawData.geo?.city?.split(', ')[0] || '',
          country: rawData.geo?.country || '',
        },
      };

      let experiences: Experience[] = [];
      let educations: Education[] = [];

      // Chuyển đổi thông tin học vấn với error handling
      try {
        if (rawData.educations && Array.isArray(rawData.educations)) {
          educations = rawData.educations.map((edu: any) => {
            return {
              schoolName: edu.schoolName || '',
              degree: edu.degree || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              graduationYear: edu.end?.year || null,
            };
          });
        }
      } catch (educationError) {
        console.error('Error processing education data:', educationError);
        console.error('Education data:', rawData.educations);
        educations = []; // Set empty array if processing fails
      }

      // Chuyển đổi thông tin kinh nghiệm làm việc với error handling
      try {
        if (rawData.position && Array.isArray(rawData.position)) {
          experiences = rawData.position.map((pos: any) => {
            return {
              companyName: pos.companyName || '',
              title: pos.title || '',
              location: pos.location || '',
              description: pos.description || '',
              employmentType: pos.employmentType || '',
              startDate:
                pos.start?.year && pos.start?.month
                  ? `${pos.start.year}-${String(pos.start.month).padStart(2, '0')}`
                  : '',
              endDate:
                pos.end?.year && pos.end?.month
                  ? `${pos.end.year}-${String(pos.end.month).padStart(2, '0')}`
                  : undefined,
            };
          });
        }
      } catch (experienceError) {
        console.error('Error processing experience data:', experienceError);
        console.error('Experience data:', rawData.position);
        experiences = []; // Set empty array if processing fails
      }

      const result: ProfileCrawl = {
        profile,
        educations: educations,
        experiences: experiences,
        status: 'pending',
        urlProfile: urlProcessed,
      };

      // Validate final result
      this.validateProfileCrawl(result);

      return result;
    } catch (error) {
      console.error('Error in transformLinkedInData:', error);
      console.error('Raw data structure:', Object.keys(rawData || {}));
      throw error;
    }
  }

  // Helper method để validate ProfileCrawl object
  private validateProfileCrawl(profileCrawl: ProfileCrawl): void {
    const requiredFields = ['profile', 'status', 'urlProfile'];
    const profileRequiredFields = ['id', 'username', 'name', 'profilePicture'];

    for (const field of requiredFields) {
      if (!profileCrawl[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    for (const field of profileRequiredFields) {
      if (profileCrawl.profile[field] === undefined || profileCrawl.profile[field] === null) {
        throw new Error(`Missing required profile field: ${field}`);
      }
    }

    // Validate name object
    if (!profileCrawl.profile.name.firstName && !profileCrawl.profile.name.lastName) {
      console.warn('Profile has no first name or last name');
    }
  }

  async getListProfile(urlProcessed: string, apiKey: string) {
    try {
      const url = `https://linkedin-data-api.p.rapidapi.com/search-people-by-url`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'x-rapidapi-host': 'linkedin-data-api.p.rapidapi.com',
          'x-rapidapi-key': `${apiKey}`,
        },
        body: JSON.stringify({
          url: urlProcessed,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json(); 
      
      if (!data.data?.items || !Array.isArray(data.data.items)) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from LinkedIn API');
      }

      const listProfile = data.data.items;
      
      const results = [];
      for (const profile of listProfile) {
        try {
          if (profile.profileURL) {
            const result = await this.crawlSingleprofile(profile.profileURL, apiKey);
            results.push(result);
          } else {
            console.warn('Profile missing profileURL:', profile);
          }
        } catch (profileError) {
          console.error(`Error processing individual profile:`, profileError);
          console.error(`Failed profile data:`, profile);
        }
      }

      return results;
    } catch (error) {
      console.error('Error fetching LinkedIn profile list:', error);
      console.error('URL processed:', urlProcessed);
      throw error;
    }
  }
  async getProfileInfo(data: any){
    let result =[] 
    console.log(data)
    for(let element of data.results ){
      let temp =await this.crawlRepository.findByProfileId(element.id_profile)
      result.push(temp)
    }
    this.client.emit('profile_info', {"result":result,"id":data.id});
  }
}