import mongoose, {Document, SchemaTypes, Types} from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "../../user/entities/user.entity";

export type AccountDocument = Account & AccountInterface & Document

export interface AccountInterface {
    _id: string;
    balance: number;
    userId:  Types.ObjectId & string;
    createdAt: Date;
    updatedAt: Date;
    _doc: any
}

@Schema({ timestamps: true })
export class Account extends Document {

    _id: string

    @Prop({type: Number, default: 0})
    balance: number;

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, unique: true })
    userId: User;

    _doc: any
}

export const AccountSchema = SchemaFactory.createForClass(Account)
