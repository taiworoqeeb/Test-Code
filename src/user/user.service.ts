import { Injectable, Inject, HttpStatus } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { UserDto, UserLoginDto, UserPasswordUpdateDto } from "./dto/user.dto";
import * as bcrypt from "bcryptjs";
import {ResponseHandler, Utils, responseHandler,} from "../util";
import { User, UserDocument, UserInterface, accountStatus } from './entities/user.entity';
import { Account, AccountDocument } from '../account/entities/account.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        public userModel: Model<UserDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        public utils: Utils
    ){}

    async registerUserAccountService(body: UserDto):Promise<ResponseHandler> {

        const { firstname, lastname, phone_no, email, password, confirm_password } = body;
        let user = await this.userModel.findOne({email})

        if(user){
            return responseHandler({
                status: false,
                message: "User Already Exist, Please Log-In!",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })

        }

        if(password !== confirm_password){
            return responseHandler({
                status: false,
                message: "Password does not match",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        user = new this.userModel({
            firstname,
            lastname,
            phone_no,
            email,
            password: hashedPass,
        })

        await user.save();

        await this.accountModel.create({
            userId: user._id,
        })

        return responseHandler({
            status: true,
            message: "Account Created Successfully",
            data: user,
            statusCode: HttpStatus.OK
        })
    }

    async loginUserAccountService(data: UserLoginDto):Promise<ResponseHandler>{
        const { email, password} = data;

        let user = await this.userModel.findOne({email: email.toLowerCase()}).select("+password")
        if(!user){
            return responseHandler({
                status: false,
                message: "The username and/or password are incorrect. Please try again",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })
        }

        if(password === "" || password === null){
            return responseHandler({
                status: false,
                message: "Password is required",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })
        }
        const validate = await bcrypt.compare(password, user.password);
        if(validate){
            if(user.status != accountStatus.ACTIVE){
                return responseHandler({
                    status: false,
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: "Your account is not active please contact support for more information",
                    data:{}
                })
            }
            const token = await this.utils.tokenHandler(user);
            return responseHandler({
                status: true,
                message: "Successfully Logged In",
                data: token,
                statusCode: HttpStatus.OK,
            })


        } else{

            return responseHandler({
                status: false,
                message: "The username and/or password are incorrect. Please try again",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })
        }
    }

    async getProfileService(userId: string){


        if (!userId) {
            return responseHandler({
                message: 'userId is required',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        const user = await this.userModel.findOne({
            _id: userId,
        }).select("-password -createdAt -updatedAt -__v");

        if (!user) {
            return responseHandler({
                message: 'User does not exist',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        const account = await this.accountModel.findOne({
            userId: user._id
        }).select({balance: 1})

        return responseHandler({
            message: 'User profile fetched successfully',
            status: true,
            statusCode: HttpStatus.OK,
            data: {...user._doc, balance: account.balance }
        })
    }

    async updateProfileService(userId: string, body: Partial<User>): Promise<ResponseHandler>{
        if(!userId){
            return responseHandler({
                message: 'userId is required',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }


        const user = await this.userModel.findById(userId);

        if(body.hasOwnProperty("email")){
            delete body.email;
        }

        if(body.hasOwnProperty("password")){
            delete body.password;
        }

        if (!user) {
            return responseHandler({
                message: 'User does not exist',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }


        const updatedUser = await this.userModel.updateOne({
            _id: user._id,
        }, {$set: {...body}})

        if(updatedUser.modifiedCount === 0){
            return responseHandler({
                message: 'Profile could not be updated',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}
            })
        }

        return responseHandler({
            message: 'Profile updated successfully',
            status: true,
            statusCode: HttpStatus.OK,
            data: {}
        })
    }

    async changePasswordService(data: UserPasswordUpdateDto, userId: any):  Promise<ResponseHandler>{
        const { oldPassword, newPassword, confirmPassword } = data;

        if (!oldPassword || !newPassword) {
            return responseHandler({
                message: 'All fields are required',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        const user = await this.userModel.findOne({
            _id: userId,
        }).select('+password')

        if (!user) {
            return responseHandler({
                message: 'User does not exist',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        if(confirmPassword !== newPassword){
            return responseHandler({
                message: 'Password does not match',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        const checkPassword = await bcrypt.compare(oldPassword, user.password);

        if (!checkPassword) {
            return responseHandler({
                message: 'Old password is incorrect',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await this.userModel.updateOne({
            _id: user._id,
        }, {$set: {password: hashedPassword}})

        if(updatedUser.modifiedCount === 0){
            return responseHandler({
                message: 'Password could not be updated',
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                data:{}
            })
        }

        return responseHandler({
            message: 'Password updated successfully',
            status: true,
            statusCode: HttpStatus.OK,
            data: {}
        })
    }

    async deleteUserAccountService(userId: string):Promise<ResponseHandler>{
        let user = await this.userModel.findById(userId)
        if(!user){
            return responseHandler({
                status: false,
                message: "User account not found",
                statusCode: HttpStatus.BAD_REQUEST,
                data: {}
            })
        }

        if(user.status != accountStatus.ACTIVE){
            return responseHandler({
                status: false,
                statusCode: HttpStatus.BAD_REQUEST,
                message: "Your account is not active",
                data:{}
            })
        }

        await user.updateOne({
            status: accountStatus.DELETED
        })

        return responseHandler({
            status: true,
            statusCode: HttpStatus.OK,
            message: "Account deleted successfully",
            data:{}
        })
    }
}
