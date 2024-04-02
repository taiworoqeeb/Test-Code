import {config} from 'dotenv'
import {Injectable, PipeTransform,
    ArgumentMetadata, BadRequestException} from '@nestjs/common'
import * as jwt from "jsonwebtoken";
import {  User } from 'src/user/entities/user.entity'
import {Types } from 'mongoose'
config()

class ResponseHandler {
    status: boolean;
    statusCode: number;
    message: string;
    data: any;
    constructor(status: boolean, statusCode: number, message: string, data: any) {
        this.status = status;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data;
    }
}

const responseHandler = (data: ResponseHandler) => {
  return {
      ...data
  }
}


const verifyPhoneNumber = (phone: string) => {
    return /^([0]{1}|\+?234)([7-9]{1})([0|1]{1})([\d]{1})([\d]{7})$/g.test(phone);
  };

@Injectable()
export class TrimPipe implements PipeTransform {
  private isObj(obj: any): boolean {
    return typeof obj === 'object' && obj !== null
  }

  private trim(values: any) {
    Object.keys(values).forEach(key => {
      if (key !== 'password' && key !== 'confirm_password' && key !== 'confirmPassword' && key !== "newPassword") {
        if (this.isObj(values[key])) {
          values[key] = this.trim(values[key])
        } else {
          if (typeof values[key] === 'string') {
            values[key] = values[key].trim()
          }

          if(key === 'phone_no'){
            if(!verifyPhoneNumber(values[key])){
              throw new BadRequestException('Invalid phone number')
            }
            if(values[key].startsWith("0")){
              values[key] = values[key].substring(1);
              values[key] = `+234${values[key]}`
            }
            if(values[key].startsWith("234")){
              return `+${values[key]}`
            }
            if(values[key].startsWith("+234")){
              return values[key]
            }

          }
        }
      }
    })
    return values
  }

  transform(values: any, metadata: ArgumentMetadata) {
    const { type } = metadata
    if (this.isObj(values) && type === 'body') {
      return this.trim(values)
    }else{
      return values
    }

    // throw new BadRequestException('Validation failed')
  }
}

const AlphaNumeric = (length: number, type: string = "alphaNumeric") => {
    let result = "";
    const characters = type === "alphaNumeric" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
      : type === "alpha" ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
      : "0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    //ensure alpha-numeric type contains both alphabet and number
    if(type === "alphaNumeric") {
      if(!(/\d/.test(result))){
        return AlphaNumeric(length, type);
      }
    }

    return result;
  };
  const queryConstructor = (query: any, sortBy:any, item:any) => {
    if (Object.values(query).includes("null")) {
      return { error: `Param value cannot be null` };
    }

    let params: any = {};
    let array: any = Object.keys(query);
    for (let i = 0; i < array.length; i++) {
      if (Object.keys(query)[i] === "id") {
        params["_id"] = new Types.ObjectId(String(Object.values(query)[i]));
      } else if (Object.keys(query)[i].endsWith("Id")) {
        params[Object.keys(query)[i]] = new Types.ObjectId(String(Object.values(query)[i]));
      } else {
        params[Object.keys(query)[i]] = Object.values(query)[i];
      }
    }

    let { limit, skip, sort } = params;
    limit = limit ? Number(limit) : 100;
    skip = skip ? Number(skip) : 0;

    if (sort === "asc" || sort === "desc") {
      if (typeof sortBy === "object") {
        let first = sortBy[Object.keys(sortBy)[0]];
        let second = sortBy[Object.keys(sortBy)[1]];

        sort = sort === "asc" ? { [first]: 1, [second]: 1 } : { [first]: -1, [second]: -1 };

      } else {
        sort = sort === "asc" ? { [sortBy]: 1 } : { [sortBy]: -1 };
      }
    } else if (sort == undefined) {
      sort = { [sortBy]: 1 };
    } else {
      return { error: `Unable to find ${item} might be because of invalid params` };
    }

    delete params.limit;
    delete params.skip;
    delete params.sort;
    return { params, limit, skip, sort };
  };

  @Injectable()
  class Utils {
  async tokenHandler( data: User,){
    try {
      const { _id, firstname, lastname, email, phone_no, status  } = data

    let identification =  "userId"

        const payload =  {
          user: {[identification]: _id, id: _id, firstname, lastname, email, phone_no, status}
         }
         const jwtOption = {expiresIn: '2d'}

        const token = jwt.sign(payload, process.env.JWT_SECRET, jwtOption)
      return { token: `Bearer ${token}`, [identification]: _id, firstname, lastname, email, phone_no, status}

    } catch (error) {
      throw new Error(`Unable to generate token. ${error.message}`);
    }
  };

}


export{
    responseHandler,
    Utils,
    AlphaNumeric,
    ResponseHandler,
    queryConstructor
}
