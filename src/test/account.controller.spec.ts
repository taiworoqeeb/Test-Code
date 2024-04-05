import { Test, TestingModule } from '@nestjs/testing';
// import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { Response, Request, NextFunction } from 'express';
import { Utils } from '../util';
import { closeInMongodConnection, rootMongooseTestModule } from './test-utils';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../user/entities/user.entity';
import { Account, AccountDocument, AccountSchema } from '../account/entities/account.entity';
import { userDoc, userDoc2 } from './mock/user.mock';
import { Model } from 'mongoose';
import { accountDoc, accountDoc2 } from './mock/account.mock';
import { HttpStatus } from '@nestjs/common';
import { AccountController, TransactionController } from '../account/account.controller';
import { AccountService } from '../account/account.service';
import { Transaction, TransactionDocument, TransactionReason, TransactionSchema } from '../account/entities/transaction.entity';
import { TransactionDto } from '../account/dto/account.dto';

describe('AccountController', () => {
  let accountController: AccountController;
  let transactionController: TransactionController;
  let mockUserModel: Model<UserDocument>
  let mockAccountModel: Model<AccountDocument>
  let mockTransactionModel: Model<TransactionDocument>
  // let userService: UserService;
  let oneTransactionId: string

  const requestMock = (query:any, body: any) => {
    return {
      query: query,
      body: body
    } as unknown as Request;
  }

  const statusResponseMock = {
    json: jest.fn((x) => x)
  }

  const responseMock = {
      status: jest.fn((x) =>statusResponseMock),
      json: jest.fn((x) => x)
  } as unknown as Response

  const nextMock = {} as unknown as NextFunction

  beforeAll(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports:[
        rootMongooseTestModule(),
        MongooseModule.forFeature([
          {name: User.name, schema: UserSchema},
          {name: Account.name, schema: AccountSchema},
          {name: Transaction.name, schema: TransactionSchema}
        ]),
      ],
      controllers: [AccountController, TransactionController],
      providers: [AccountService, UserService, Utils],
    }).compile();

    mockUserModel = app.get<Model<UserDocument>>(getModelToken(User.name))
    mockAccountModel = app.get<Model<AccountDocument>>(getModelToken(Account.name))
    mockTransactionModel = app.get<Model<TransactionDocument>>(getModelToken(Transaction.name))


    await mockUserModel.insertMany([userDoc, userDoc2]);
    await mockAccountModel.insertMany([accountDoc, accountDoc2]);
    accountController = app.get<AccountController>(AccountController);
    transactionController = app.get<TransactionController>(TransactionController)
    // userService = app.get<UserService>(UserService)
  });

  it('should be defined', () =>{
    expect(accountController).toBeDefined();
  })

  describe('Account & Transaction feature', () =>{
    it('should initiate fund user account transaction', async() =>{
        const userId = userDoc._id
          const data: TransactionDto = {
              amount: 200,
              type: TransactionReason.FUND,
          }

          await transactionController.inititateTransactonConroller(data, userId, requestMock(null, null), responseMock, nextMock)

        expect(responseMock.status).toHaveBeenCalledWith(200);
        expect(statusResponseMock.json).toHaveBeenCalledWith({
          status: true,
          statusCode: HttpStatus.OK,
          message: "Account funded successfully",
          data:{}
        })
    })

    it('should initiate transfer to another user account transaction', async() =>{
      const userId = userDoc._id
        const data: TransactionDto = {
            amount: 200,
            type: TransactionReason.TRANSFER,
            transferRecipient: userDoc2._id
        }

        await transactionController.inititateTransactonConroller(data, userId, requestMock(null, null), responseMock, nextMock)

      expect(responseMock.status).toHaveBeenCalledWith(200);
      expect(statusResponseMock.json).toHaveBeenCalledWith({
        status: true,
        statusCode: HttpStatus.OK,
        message: "Transferred successfully",
        data:{}
      })
  })

  it('should initiate withdrawal from user account transaction', async() =>{
    const userId = userDoc._id
      const data: TransactionDto = {
          amount: 100,
          type: TransactionReason.WITHDRAWAL,
      }

      await transactionController.inititateTransactonConroller(data, userId, requestMock(null, null), responseMock, nextMock)

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(statusResponseMock.json).toHaveBeenCalledWith({
      status: true,
      statusCode: HttpStatus.OK,
      message: "Withdrawal successful",
      data:{}
    })
  })

  it('should throw an error "Insufficient balance" message', async() =>{
    const userId = userDoc._id
      const data: TransactionDto = {
          amount: 100,
          type: TransactionReason.WITHDRAWAL,
      }

      await transactionController.inititateTransactonConroller(data, userId, requestMock(null, null), responseMock, nextMock)

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(statusResponseMock.json).toHaveBeenCalledWith({
      status: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: "Insufficient balance",
      data:{}
    })
  })

  it('should throw error that amount is below 10 naira', async() =>{
    const userId = userDoc._id
      const data: TransactionDto = {
          amount: 9,
          type: TransactionReason.FUND,
      }

      await transactionController.inititateTransactonConroller(data, userId, requestMock(null, null), responseMock, nextMock)

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(statusResponseMock.json).toHaveBeenCalledWith({
      status: false,
      statusCode: HttpStatus.BAD_REQUEST,
      message: "Amount can't be lesser than 10 naira",
      data:{}
    })
  })

  it('should get user account balance', async() =>{
    const userId = userDoc2._id

      await accountController.getAccountBalanceController( userId, requestMock(null, null), responseMock, nextMock)

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(statusResponseMock.json).toHaveReturned()
  })

  it('should fetch user transactons', async() =>{
    const userId = userDoc._id

      await transactionController.getAllTransactionController( userId, {}, requestMock(null, null), responseMock, nextMock)

      const transactions = await mockTransactionModel.find({
        userId: userDoc._id
      })

      oneTransactionId = transactions[0]._id

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(statusResponseMock.json).toHaveBeenCalledWith({
      status: true,
      statusCode: HttpStatus.OK,
      message: "transactions fetched successfully",
      data:{
          totalTransactions: transactions.length,
          transactions: transactions
      }
    })


  })

  it('should fetch a single transaction', async() =>{

      await transactionController.getTransactionController( oneTransactionId, requestMock(null, null), responseMock, nextMock)

      const transaction = await mockTransactionModel.findById(oneTransactionId)

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(statusResponseMock.json).toHaveBeenCalledWith({
      status: true,
      statusCode: HttpStatus.OK,
      message: "Transaction fetched successfully",
      data: transaction
    })
  })


  })

  afterAll(async () => {
    await closeInMongodConnection();
  });

});
