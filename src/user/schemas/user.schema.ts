// src/user/schemas/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop({ sparse: true, unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  address?: string;

  @Prop({ default: 'user' })
  role: string;

  // 👇 New field for OTP login
  @Prop({ unique: true, sparse: true }) // `sparse` allows null for email-only users
  phone?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
