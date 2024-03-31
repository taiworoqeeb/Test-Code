import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema, UserInterface } from './entities/user.entity';
// import { UtilsModule } from 'src/util/index.module';
import { Model } from 'mongoose';
import { Utils } from '../util';
import { Account } from '../account/entities/account.entity';

describe('UserService', () => {
  let service: UserService;
  let mockUserModel: Model<UserDocument>

  beforeEach(async () => {
    function mockUserModel(dto: any) {
      this.data = dto;
      this.save  = () => {
        return this.data;
      };
    }

    const module: TestingModule = await Test.createTestingModule({
      // imports:[
      //   MongooseModule.forFeature([{name: User.name, schema: UserSchema}
      // ]),
      // ],
      providers: [
        UserService,
        Utils,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel
        },
        {
          provide: getModelToken(Account.name),
          useValue: mockUserModel
        },

      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
