import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { closeInMongodConnection, rootMongooseTestModule } from '../util/test-utils';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema } from '../user/entities/user.entity';
import { Account, AccountDocument, AccountSchema } from './entities/account.entity';
import { UserService } from '../user/user.service';
import { Utils } from '../util';
import { Transaction, TransactionDocument, TransactionReason, TransactionSchema } from './entities/transaction.entity';
import mongoose, { Model } from 'mongoose';
import { userDoc, userDoc2 } from '../user/mock/user.mock';
import { accountDoc, accountDoc2 } from './mock/account.mock';
import { HttpStatus } from '@nestjs/common';
import { TransactionDto } from './dto/account.dto';

describe('AccountService', () => {
  let service: AccountService;
  let mockUserModel: Model<UserDocument>
  let mockAccountModel: Model<AccountDocument>
  let mockTransactionModel: Model<TransactionDocument>
  let oneTransactionId: string

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountService, UserService, Utils],
      imports:[
        rootMongooseTestModule(),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}, {name: Account.name, schema: AccountSchema}, {name: Transaction.name, schema: TransactionSchema}
      ]),
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    mockUserModel = module.get<Model<UserDocument>>(getModelToken(User.name))
    mockAccountModel = module.get<Model<AccountDocument>>(getModelToken(Account.name))
    mockTransactionModel = module.get<Model<TransactionDocument>>(getModelToken(Transaction.name))


    await mockUserModel.insertMany([userDoc, userDoc2]);
    await mockAccountModel.insertMany([accountDoc, accountDoc2]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe("User transactions", () =>{
      it('should fund user account  balance', async() =>{
          const userId = userDoc._id
          const data: TransactionDto = {
              amount: 200,
              type: TransactionReason.FUND,
          }

            const {status, statusCode} = await service.initiateTransactionService(userId, data)

          const account = await mockAccountModel.findOne({
              userId: userDoc._id
          })

          expect(status).toBeTruthy
          expect(statusCode).toEqual(HttpStatus.OK)
          expect(account.balance).toEqual(300)

      })

      it('should transfer to another user account balance', async() =>{
        const userId = userDoc._id
        const data: TransactionDto = {
            amount: 200,
            type: TransactionReason.TRANSFER,
            transferRecipient: userDoc2._id
        }

          const {status, statusCode} = await service.initiateTransactionService(userId, data)

        const account = await mockAccountModel.findOne({
            userId: userDoc._id
        })
        const account2 = await mockAccountModel.findOne({
            userId: userDoc2._id
        })

        expect(status).toBeTruthy
        expect(statusCode).toEqual(HttpStatus.OK)
        expect(account.balance).toEqual(100)
        expect(account2.balance).toEqual(200)

    })

    it('should withdraw from user account balance', async() =>{
      const userId = userDoc._id
      const data: TransactionDto = {
          amount: 100,
          type: TransactionReason.WITHDRAWAL,
      }

        const {status, statusCode} = await service.initiateTransactionService(userId, data)

      const account = await mockAccountModel.findOne({
          userId: userDoc._id
      })

      expect(status).toBeTruthy
      expect(statusCode).toEqual(HttpStatus.OK)
      expect(account.balance).toEqual(0)

    })

    it('should throw an error "Insufficient balance"', async() =>{
      const userId = userDoc._id
      const data: TransactionDto = {
          amount: 100,
          type: TransactionReason.WITHDRAWAL,
      }

        const {status, statusCode, message} = await service.initiateTransactionService(userId, data)


      expect(status).toBeFalsy
      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(message).toEqual("Insufficient balance")

    })

    it('should throw error that amount is below 10 naira', async() =>{
      const userId = userDoc._id
      const data: TransactionDto = {
          amount: 9,
          type: TransactionReason.FUND,
      }

        const {status, statusCode, message} = await service.initiateTransactionService(userId, data)

      expect(status).toBeFalsy
      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(message).toEqual("Amount can't be lesser than 10 naira")

    })

    it('should get user account balance', async() =>{
      const {status, statusCode, data} = await service.getAccountBalanceService(userDoc2._id)
      const account = await mockAccountModel.findOne({
        userId: userDoc2._id
      })

      expect(status).toBeTruthy
      expect(statusCode).toEqual(HttpStatus.OK)
      expect(data.balance).toEqual(account.balance)
    })

    it('should fetch user transactons', async() =>{
      const {status, statusCode, data} = await service.getTransactionsService(userDoc._id, {})
      const transaction = await mockTransactionModel.find({
        userId: userDoc._id
      })

      oneTransactionId = transaction[0]._id

      expect(status).toBeTruthy
      expect(statusCode).toEqual(HttpStatus.OK)
      expect(data.transactions).toEqual(transaction)
      expect(data.totalTransactions).toEqual(transaction.length)
    })

    it('should fetch a single transaction', async() =>{
      const {status, statusCode, data} = await service.getTransactionByIdService(oneTransactionId)

      const transaction = await mockTransactionModel.findById(oneTransactionId)

      expect(status).toBeTruthy
      expect(statusCode).toEqual(HttpStatus.OK)
      expect(data).toEqual(transaction)
    })
  })

  afterAll(async () => {
    await closeInMongodConnection();
  });
});

