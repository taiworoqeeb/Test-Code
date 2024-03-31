import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Utils } from '../util';
import { Account } from '../account/entities/account.entity';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    function mockUserModel(dto: any) {
      this.data = dto;
      this.save  = () => {
        return this.data;
      };
    }
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
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

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
