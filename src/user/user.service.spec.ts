import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { User, UserDocument, UserSchema, UserInterface, accountStatus } from './entities/user.entity';
// import { UtilsModule } from 'src/util/index.module';
import { Model } from 'mongoose';
import { Utils } from '../util';
import { Account, AccountDocument, AccountSchema } from '../account/entities/account.entity';
import { userDoc } from './mock/user.mock';
import { HttpStatus } from '@nestjs/common';
import { closeInMongodConnection, rootMongooseTestModule } from '../util/test-utils';
import { accountDoc } from '../account/mock/account.mock';
import { UserPasswordUpdateDto } from './dto/user.dto';


describe('UserService', () => {
  let service: UserService;
  let mockUserModel: Model<UserDocument>
  let mockAccountModel: Model<AccountDocument>

  beforeAll(async () => {

    const module: TestingModule = await Test.createTestingModule({
      imports:[
        rootMongooseTestModule(),
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}, {name: Account.name, schema: AccountSchema}
      ]),
      ],
      providers: [
        UserService,
        Utils,
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockUserModel = module.get<Model<UserDocument>>(getModelToken(User.name))
    mockAccountModel = module.get<Model<AccountDocument>>(getModelToken(Account.name))

    await mockUserModel.insertMany([userDoc]);
    await mockAccountModel.insertMany([accountDoc]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('User Authentication', () =>{
    it('should throw an error when trying to create when the password and confrim password don\'t match', async() =>{

      const body = {
        "firstname": "John",
        "lastname": "Doe",
        "phone_no": "08013097285",
        "email": "test@gmail.com",
        "password": "password123",
        "confirm_password": "password1234"
       }

       const {status, statusCode, message} = await service.registerUserAccountService(body)

       expect(statusCode).toEqual(HttpStatus.BAD_REQUEST)
       expect(status).toBeFalsy
       expect(message).toEqual("Password does not match")

     })

    it('should create a new user', async() =>{
        const body = {
          "firstname": "John",
          "lastname": "Doe",
          "phone_no": "08013097285",
          "email": "test@gmail.com",
          "password": "password123",
          "confirm_password": "password123"
        }

        const {status, statusCode, message, data} = await service.registerUserAccountService(body)

        expect(statusCode).toEqual(HttpStatus.OK)
        expect(status).toBeTruthy
        expect(message).toEqual("Account Created Successfully")
        expect(data.firstname).toEqual(body.firstname)
        expect(data.lastname).toEqual(body.lastname)
        expect(data.email).toEqual(body.email)
        expect(data.phone_no).toEqual(body.phone_no)
    })

    it('should throw an error when trying login with existing email', async() =>{

     const body = {
        "firstname": "John",
        "lastname": "Doe",
        "phone_no": "08013097283",
        "email": "test@gmail.com",
        "password": "password123",
        "confirm_password": "password123"
      }

      const {status, statusCode, message} = await service.registerUserAccountService(body)

      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(status).toBeFalsy
      expect(message).toEqual("User Already Exist, Please Log-In!")

    })

    it('should get user profile', async() =>{
      const {status, statusCode, data} = await service.getProfileService(userDoc._id)

      expect(statusCode).toEqual(HttpStatus.OK)
      expect(status).toBeTruthy
      expect(data.firstname).toEqual(userDoc.firstname)
      expect(data.lastname).toEqual(userDoc.lastname)
      expect(data.email).toEqual(userDoc.email)
      expect(data.phone_no).toEqual(userDoc.phone_no)
    })

    it('should update user profile', async() =>{
      const body = {
        firstname: "taiwo"
      }

      const {status, statusCode, data} = await service.updateProfileService(userDoc._id, body)
      const updatedUser = await mockUserModel.findById(userDoc._id)

      expect(statusCode).toEqual(HttpStatus.OK)
      expect(status).toBeTruthy
      expect(updatedUser.firstname).toEqual(body.firstname)
    })

    it('should change user password', async() =>{
        const body: UserPasswordUpdateDto = {
            oldPassword: "password123",
            newPassword: "d15597",
            confirmPassword: "d15597"
        }

        const {status, statusCode, message} = await service.changePasswordService(body, userDoc._id)

        expect(statusCode).toEqual(HttpStatus.OK)
        expect(status).toBeTruthy
        expect(message).toEqual("Password updated successfully")

    })

    it('should throw error, password incorrect', async() =>{
      const body: UserPasswordUpdateDto = {
          oldPassword: "password123",
          newPassword: "d15597",
          confirmPassword: "d15597"
      }

      const {status, statusCode, message} = await service.changePasswordService(body, userDoc._id)

      expect(statusCode).toEqual(HttpStatus.BAD_REQUEST)
      expect(status).toBeFalsy
      expect(message).toEqual("Old password is incorrect")
    })

    it('should soft delete account', async() =>{
        const {status, statusCode} = await service.deleteUserAccountService(userDoc._id)
        const deletedAccount = await mockUserModel.findById(userDoc._id)

        expect(statusCode).toEqual(HttpStatus.OK)
        expect(status).toBeTruthy
        expect(deletedAccount.status).toEqual(accountStatus.DELETED)
    })
  })





  afterAll(async () => {
    await closeInMongodConnection();
  });
});
