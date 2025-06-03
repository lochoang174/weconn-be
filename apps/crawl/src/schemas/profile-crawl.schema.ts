import { AbstractDocument } from "@app/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Type } from "class-transformer";
import { LinkedInProfile } from "./linkedin-profile.schema";
import { Education } from "./education.schema";
import { Experience } from "./experience.schema";

@Schema({ timestamps: true })
export class ProfileCrawl extends AbstractDocument {
  @Prop({ type: LinkedInProfile, required: true })
  @Type(() => LinkedInProfile)
  profile: LinkedInProfile;

  @Prop({ type: [Education], default: [] })
  @Type(() => Education)
  educations: Education[];

  @Prop({ type: [Experience], default: [] })
  @Type(() => Experience)
  experiences: Experience[];


  @Prop({ default: 'pending', enum: ['pending', 'completed', 'failed'] })
  status: string;
  @Prop({ required: true })
  urlProfile: string;

}

export const ProfileCrawlSchema = SchemaFactory.createForClass(ProfileCrawl);
