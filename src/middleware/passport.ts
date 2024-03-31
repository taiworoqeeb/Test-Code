import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPayload } from "../user/dto/user.dto";
import * as dotenv from "dotenv";
import { User, UserDocument } from "../user/entities/user.entity";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
dotenv.config();

@Injectable()
export class Passport extends PassportStrategy(Strategy){
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>
        ){
        super({
            secretOrKey: process.env.JWT_SECRET as string,
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        });
    }
        async validate(payload: UserPayload): Promise<User>{
        const user = await this.userModel.findById(payload.user.id);
        if(!user){
            return null
        }
        return user;
    }
}
