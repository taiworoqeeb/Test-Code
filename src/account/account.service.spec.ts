import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { closeInMongodConnection, rootMongooseTestModule } from '../util/test-utils';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import { Account, AccountSchema } from './entities/account.entity';
import { UserService } from '../user/user.service';
import { Utils } from '../util';
import { Transaction, TransactionSchema } from './entities/transaction.entity';

describe('AccountService', () => {
  let service: AccountService;

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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterAll(async () => {
    await closeInMongodConnection();
  });
});

