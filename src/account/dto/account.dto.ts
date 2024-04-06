import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsNumber, Min} from 'class-validator';
import { Transaction, TransactionReason } from "../entities/transaction.entity";

export class TransactionDto{

    @ApiProperty({type: Number, default: 100, description: "Amount for transaction"})
    @IsNumber()
    @Min(10)
    @IsNotEmpty()
    amount: number

    @ApiProperty({type: String, default: TransactionReason.FUND, description: "Transaction type/reason"})
    @IsNotEmpty()
    @IsString()
    type: TransactionReason

    @ApiProperty({type: String, default: "1234567890", description: "The receiver userId"})
    transferRecipient?: string

}

export class TransactionParam{
    @ApiProperty({name: "transactionId", type: String, default: "sdksdsuihsfdddfd", description: "The User's transaction Id"})
    @IsString()
    @IsNotEmpty()
    transactionId: string
}

export class TransactionQuery{
    @ApiProperty({name: "query", type: Object, description: "Query Transaction"})
    query: Partial<Transaction>
}
