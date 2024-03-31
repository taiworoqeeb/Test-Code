import {Document, SchemaTypes, Types} from "mongoose";
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from "../../user/entities/user.entity";

export type TransactionDocument = Transaction & Document

export enum TransactionReason{
    WITHDRAWAL= "withdrawal",
    TRANSFER = "transfer",
    FUND= "fund"
}

@Schema({ timestamps: true })
export class Transaction extends Document {

    _id: string

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId;

    @Prop({type: String})
    reference: string

    @Prop({type: Number})
    amount: number

    @Prop({type: Number})
    accountBalance: number

    @Prop({type: String, enum: ["SUCCESS", "FAILED"],})
    status: string

    @Prop({type: String, enum: ["DEBIT", "CREDIT"],})
    type: string

    @Prop({type: String, enum: TransactionReason})
    reason: string

}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)
