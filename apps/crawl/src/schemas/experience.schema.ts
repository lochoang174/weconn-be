import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Experience {
  @Prop()
  companyName: string;

  @Prop()
  title: string;

  @Prop()
  location: string;

  @Prop()
  description: string;

  @Prop()
  employmentType: string;

  @Prop()
  startDate: string;

  @Prop()
  endDate?: string;
}
