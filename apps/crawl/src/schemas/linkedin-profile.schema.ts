import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class LinkedInProfile {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  headline: string;

  @Prop({ required: true })
  profilePicture: string;

  @Prop()
  summary: string;

  @Prop({ required: true, type: Object })
  name: {
    firstName: string;
    lastName: string;
  };

  @Prop({ required: true, type: Object })
  location: {
    city: string;
    country: string;
  };
}
