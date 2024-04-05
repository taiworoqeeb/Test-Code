import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail, MinLength, IsBoolean, MaxLength, IsNumber, ValidateIf} from 'class-validator';


export class UserDto{

    @ApiProperty({type: String, default: "John", description: "The User's Firstname"})
    @IsString()
    @IsNotEmpty()
    firstname: string

    @ApiProperty({type: String, default: "Doe", description: "The User's Lastname"})
    @IsNotEmpty()
    @IsString()
    lastname: string

    @ApiProperty({type: String, default: "1234567890", description: "The User's Phone Number"})
    @IsString()
    @IsNotEmpty()
    phone_no: string

    @ApiProperty({type: String, default: "johndoe@email.com", description: "The User's Email"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    // @ApiProperty({type: String, default: "Doe"})
    // @IsString()
    // @IsNotEmpty()
    // username: string

    @ApiProperty({type: String, default: "password123"})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string

    @ApiProperty({type: String, default: "password123"})
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    confirm_password: string

}

export class UserLoginDto{

    @ApiProperty({type: String, default: "Doe"})
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({type: String, default: "password123"})
    @IsString()
    @IsNotEmpty()
    password: string
}

export class UserParam{
    @ApiProperty({name: "userId", type: String, default: "sdksdsuihsfdddfd", description: "The User's Id"})
    @IsString()
    @IsNotEmpty()
    userId: string
}

export class UserUpdateDto{
    @ApiProperty({type: String, default: "John", description: "The User's Firstname"})
    @IsString()
    @IsNotEmpty()
    firstname?: string

    @ApiProperty({type: String, default: "Doe", description: "The User's Lastname"})
    @IsNotEmpty()
    @IsString()
    lastname?: string

    @ApiProperty({type: String, default: "1234567890", description: "The User's Phone Number"})
    @IsString()
    @IsNotEmpty()
    phone_no?: string
}

export class UserPasswordUpdateDto{
    @ApiProperty({type: String, default: "password123"})
    oldPassword: string

    @ApiProperty({type: String, default: "password123"})
    newPassword: string

    @ApiProperty({type: String, default: "password123"})
    confirmPassword: string
}

export class UserPayload{
    user:{
        userId: string
        id: string
        firstname: string
        lastname: string
        // username:string
        email: string
        phone_no: string,
        status: string
    }
}
