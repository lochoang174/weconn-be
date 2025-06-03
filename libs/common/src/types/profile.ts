
export interface LinkedInProfile {
  id: number;
  username: string;
  name: {
    firstName: string;
    lastName: string;
  };
  headline: string;
  profilePicture: string; 
  summary: string;
  location: {
    city: string;
    country: string;
  };
}

export interface Education {
  schoolName: string;
  degree: string;
  fieldOfStudy: string;
  graduationYear: number;
}

export interface Experience {
  companyName: string;
  title: string;
  location: string;
  description: string;
  employmentType: string;
  startDate: string; // Store as "YYYY-MM" format
  endDate?: string; // Optional for current positions
}

export interface SimplifiedLinkedInData {
  profile: LinkedInProfile;
  educations: Education[];
  experiences: Experience[];
}
