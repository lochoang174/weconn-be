import { Prop, Schema } from "@nestjs/mongoose";

@Schema({ _id: false })
export class Education {
  @Prop()
  schoolName: string;

  @Prop()
  degree: string;

  @Prop()
  fieldOfStudy: string;

  @Prop()
  graduationYear: number;
}
