import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController, TransactionController } from './account.controller';
import { UserModule } from '../user/user.module';
import { UserService } from '../user/user.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../user/entities/user.entity';
import { Account, AccountSchema } from './entities/account.entity';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { Utils } from '../util';
import { Passport } from '../middleware/passport';

@Module({
  controllers: [AccountController, TransactionController],
  providers: [AccountService, UserService, Utils, Passport],
  imports:[
    UserModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    MongooseModule.forFeature([{name: User.name, schema: UserSchema,}, {name: Account.name, schema: AccountSchema}, {
      name: Transaction.name, schema: TransactionSchema
    }
    ]),
  ]
})
export class AccountModule {}
