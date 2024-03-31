import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, Res, Next, HttpStatus, Put, Query } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express'
import { AccountService } from './account.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { logger } from '../util/logger';
import { errorMessageHandler } from '../util/error';
import { TransactionDto, TransactionParam, TransactionQuery } from './dto/account.dto';
import mongoose from 'mongoose';
import { UserParam } from 'src/user/dto/user.dto';
import { InjectConnection } from '@nestjs/mongoose';

@ApiTags("USER ACCOUNT")
@Controller({
  path: "user/:userId/account",
  version: "1"
})
export class AccountController {
  constructor(
    private readonly accountService: AccountService
    ) {}

    @Get("account-balance")
    @UseGuards(AuthGuard("jwt"))
    // @ApiParam(UserParam)
    @ApiBearerAuth('Authorization')
    async getAccountBalanceController(@Param("userId") userId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
          const result = await this.accountService.getAccountBalanceService(userId)
          // console.log(result)
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

@ApiTags("USER TRANSACTION")
@Controller({
  path: "user/:userId/transaction",
  version: "1"
})
export class TransactionController{
  constructor(
    private readonly accountService: AccountService,
    @InjectConnection() private readonly connection: mongoose.Connection
    ) {}

    @Post("initiate-transaction")
    @UseGuards(AuthGuard("jwt"))
    @ApiBearerAuth('Authorization')
    // @ApiParam(UserParam)
    @ApiBody({
      description: "Initiate Transaction",
      type: TransactionDto
    })
    async inititateTransactonConroller(@Body() body: TransactionDto, @Param("userId") userId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      const session = await this.connection.startSession()

      try {
          session.startTransaction()
          const result = await this.accountService.initiateTransactionService(userId, body, session)
          if(!result.status){
              await session.abortTransaction()
              await session.endSession()
          }else{
            await session.commitTransaction()
            await session.endSession()
          }
          return res.status(result.statusCode).json(result)
      } catch (error) {
        await session.abortTransaction()
        await session.endSession()
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: errorMessageHandler(error),
          data: {}
        })
        logger.error(error.message, {statusCode: (error.status || HttpStatus.INTERNAL_SERVER_ERROR), route: req.originalUrl, method: req.method, error: error})
        next(error);
      }
    }

    @Get("get-all-transactions")
    @UseGuards(AuthGuard("jwt"))
    // @ApiParam(UserParam)
    @ApiBearerAuth('Authorization')
    @ApiQuery({
      description: "Transaction query",
      type: TransactionQuery
    })
    async getAllTransactionController(@Param("userId") userId: string, @Query() query: any, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.accountService.getTransactionsService(userId, query)
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

    @Get(":transactionId/get-transaction")
    @UseGuards(AuthGuard("jwt"))
    // @ApiParam(TransactionParam)
    @ApiBearerAuth('Authorization')
    async getTransactionController(@Param("transactionId") transactionId: string, @Req() req: Request, @Res() res: Response, @Next() next: NextFunction){
      try {
        const result = await this.accountService.getTransactionByIdService(transactionId)
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
