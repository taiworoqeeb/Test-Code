import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
// import { UtilsModule } from 'src/util/index.module';
import { Passport } from '../middleware/passport';
import { ConfigModule } from '@nestjs/config';
import { Account, AccountSchema } from 'src/account/entities/account.entity';
import { Utils } from 'src/util';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema,}, {name: Account.name, schema: AccountSchema}
    ]),
],
  controllers: [UserController],
  providers: [UserService, Passport, Utils],
  exports: [UserService]
})
export class UserModule {}
