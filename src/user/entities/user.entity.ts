import mongoose, {HydratedDocument, Document, Types, SchemaTypes} from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Request } from "express";



export type UserDocument = User &  Document;

export interface UserInterface extends Document{
    _id: Types.ObjectId & string;
    firstname: string;
    lastname: string;
    // username: string;
    email: string;
    password: string;
    phone_no: string | null;
    status: string,
    createdAt: Date;
    updatedAt: Date;
    _doc?: any
}

export interface CustomRequest extends Request {
    user?: UserInterface;
}

export enum accountStatus{
    ACTIVE="active",
    DELETED="deleted"
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true, minlength: 3, maxlength: 20 })
  firstname: string;

  @Prop({ type: String, required: true, minlength: 3, maxlength: 20 })
  lastname: string;

//   @Prop({ type: String, required: true, unique: true, minlength: 3, maxlength: 20 })
//   username: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true, select: false })
  password: string;

  @Prop({ type: String, default: null })
  phone_no: string;

  @Prop({ type: String, enum: accountStatus, default: accountStatus.ACTIVE })
  status: accountStatus;

  _doc: any
}

export const UserSchema = SchemaFactory.createForClass(User);
