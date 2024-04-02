import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Account, AccountDocument } from './entities/account.entity';
import { Model, ClientSession } from 'mongoose';
import { Transaction, TransactionDocument, TransactionReason } from './entities/transaction.entity';
import { AlphaNumeric, ResponseHandler, queryConstructor, responseHandler } from '../util';
import { UserService } from '../user/user.service';
import { TransactionDto } from './dto/account.dto';


@Injectable()
export class AccountService {
    constructor(
        @InjectModel(Account.name)
        public accountModel: Model<AccountDocument>,
        @InjectModel(Transaction.name)
        public transactionModel: Model<TransactionDocument>,
        @Inject(UserService)
        private userService: UserService
    ){}

    async initiateTransactionService(userId: string, data: TransactionDto, session?: ClientSession):Promise<ResponseHandler>{
        const user = await this.userService.userModel.findById(userId)
        if(!user){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "User account not found",
                data:{}
            })
        }

        if(data.amount < 10){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Amount can't be lesser than 10 naira",
                data:{}
            })
        }


        if(data.type === TransactionReason.FUND){
            
            const account = await this.accountModel.findOne({
                userId: user._id
            })

            if(!account){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "User account no found",
                    data:{}
                })
            }
            account.balance += data.amount
            await account.save({session: session})

            await this.transactionModel.create([{
                userId: user._id,
                reference: AlphaNumeric(8).toUpperCase(),
                amount: data.amount,
                accountBalance: data.amount + account.balance,
                status: "SUCCESS",
                type: "CREDIT",
                reason: data.type
            }], {session: session})

            return responseHandler({
                status: true,
                statusCode: HttpStatus.OK,
                message: "Account funded successfully",
                data:{}
            })
        }else if(data.type === TransactionReason.TRANSFER){

            const receiver = await this.userService.userModel.findById(data.transferRecipient)
            if(!receiver){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Unable to find recipient user account",
                    data:{}
                })
            }

            const receiverAccount = await this.accountModel.findOne({
                userId: receiver._id
            })

            if(!receiverAccount){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Recipient account no found",
                    data:{}
                })
            }


            const account = await this.accountModel.findOne({
                userId: user._id
            })

            if(!account){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "User account no found",
                    data:{}
                })
            }

            if( account.balance < data.amount){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Insufficient balance",
                    data:{}
                })
            }

            account.balance -= data.amount
            await account.save({session: session})

            receiverAccount.balance += data.amount
            await receiverAccount.save({session: session})

            await this.transactionModel.create([{
                userId: user._id,
                reference: AlphaNumeric(8).toUpperCase(),
                amount: data.amount,
                accountBalance: account.balance - data.amount,
                status: "SUCCESS",
                type: "DEBIT",
                reason: data.type
            }], {session: session})

            await this.transactionModel.create([{
                userId: receiver._id,
                reference: AlphaNumeric(8).toUpperCase(),
                amount: data.amount,
                accountBalance: receiverAccount.balance + data.amount,
                status: "SUCCESS",
                type: "CREDIT",
                reason: data.type
            }], {session: session})

            return responseHandler({
                status: true,
                statusCode: HttpStatus.OK,
                message: "Transferred successfully",
                data:{}
            })
        }else if(data.type === TransactionReason.WITHDRAWAL){
            const account = await this.accountModel.findOne({
                userId: user._id
            })

            if(!account){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "User account no found",
                    data:{}
                })
            }

            if( account.balance < data.amount){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Insufficient balance",
                    data:{}
                })
            }

           account.balance -= data.amount
           await account.save({session: session})

            await this.transactionModel.create([{
                userId: user._id,
                reference: AlphaNumeric(8).toUpperCase(),
                amount: data.amount,
                accountBalance: account.balance - data.amount,
                status: "SUCCESS",
                type: "DEBIT",
                reason: data.type
            }], {session: session})

            return responseHandler({
                status: true,
                statusCode: HttpStatus.OK,
                message: "Withdrawal successful",
                data:{}
            })
        }else{
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Invalid transaction type",
                data:{}
            })
        }

    }

    async getAccountBalanceService(userId: string):Promise<ResponseHandler>{
        const user = await this.userService.userModel.findById(userId)
        if(!user){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "User not found",
                data:{}
            })
        }

        const account = await this.accountModel.findOne({
            userId: user._id
        }).populate("userId", "firstname lastname email")

        if(!account){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "User account not found",
                data:{}
            })
        }

        return responseHandler({
            status: true,
            statusCode: HttpStatus.OK,
            message: "Account fetched successfully",
            data: account
        })
    }

    async getTransactionsService(userId: string, query: any):Promise<ResponseHandler>{
        const { error, sort, params, limit, skip } = queryConstructor(query, "createdAt", "transactions");
        if (error) {
              return responseHandler({message: error, status: false, statusCode: HttpStatus.BAD_REQUEST, data: {}});
        }

        const transactions: Transaction[]  = await this.transactionModel.find({...params, userId: userId}).sort(sort).limit(limit).skip(skip)

        if(transactions.length == 0){
            return responseHandler({
                status: true,
                statusCode: HttpStatus.OK,
                message: "No transaction availbale",
                data:{
                    totalTransactions: 0,
                    transactions: []
                }
            })
        }

        return responseHandler({
            status: true,
            statusCode: HttpStatus.OK,
            message: "transactions fetched successfully",
            data:{
                totalTransactions: transactions.length,
                transactions: transactions
            }
        })

    }

    async getTransactionByIdService(transactionId: string):Promise<ResponseHandler>{
        const transaction = await this.transactionModel.findById(transactionId)

        if(!transaction){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Transaction not found",
                data:{}
            })
        }

        return responseHandler({
            status: true,
            statusCode: HttpStatus.OK,
            message: "Transaction fetched successfully",
            data: transaction
        })

    }
}
