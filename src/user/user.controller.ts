import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res, Next, HttpStatus, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { NextFunction, Request, Response } from 'express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { logger } from '../util/logger';
import { CustomRequest } from '../user/entities/user.entity';
import { UserDto, UserLoginDto, UserParam, UserPasswordUpdateDto, UserUpdateDto } from './dto/user.dto';
import { errorMessageHandler } from '../util/error';


@ApiTags("USER AUTHENTICATION")
@Controller({
  path: "user",
  version: "1"
})
export class UserController {
  constructor(
    private readonly userService: UserService
    ) {}

    @Post('register')
    @ApiBody({
      description: "User registration",
      type: UserDto
    })
    async registerAccountController(@Body() body: UserDto, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.userService.registerUserAccountService(body)
        return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: errorMessageHandler(error),
            data: {}
        })
        logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
        next(error);
      }
    }

    @Post('login')
    @ApiBody({
      description: "User login",
      type: UserLoginDto
    })
    async loginAccountController(@Body() body: UserLoginDto, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.userService.loginUserAccountService(body)
        return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: errorMessageHandler(error),
            data: {}
        })
        logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
        next(error);
      }
    }

    @Get(":userId/profile")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth('Authorization')
    // @ApiParam(UserParam)
    async getProfileController(@Req() req: CustomRequest, @Res() res: Response, @Next() next: NextFunction){
      try {
          const result = await this.userService.getProfileService(req.user)
          return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessageHandler(error),
          data: {}
      })
      logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
      next(error);
      }
    }

    @Put(":userId/update-account")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth('Authorization')
    // @ApiParam(UserParam)
    @ApiBody({
      description: "Update user account",
      type: UserUpdateDto
    })
    async updateUserAccounController(@Body() body: UserUpdateDto, @Param("userId") userId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.userService.updateProfileService(userId, body)
        return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessageHandler(error),
          data: {}
      })
      logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
      next(error);
      }
    }

    @Put(":userId/change-password")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth('Authorization')
    // @ApiParam(UserParam)
    @ApiBody({
      description: "Change password",
      type: UserPasswordUpdateDto
    })
    async changeUserPassowrdController(@Body() body: UserPasswordUpdateDto, @Param("userId") userId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.userService.changePasswordService(body, userId)
        return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessageHandler(error),
          data: {}
      })
      logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
      next(error);
      }
    }

    @Delete(":userId/delete-account")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth('Authorization')
    // @ApiParam(UserParam)
    async deleteAccountController(@Param("userId") userId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.userService.deleteUserAccountService(userId)
        return res.status(result.statusCode).json(result)
      } catch (error) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessageHandler(error),
          data: {}
        })
        logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
        next(error);
      }
    }

}
