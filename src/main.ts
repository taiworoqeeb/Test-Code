import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from "dotenv"
import { BadRequestException, HttpStatus, ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as bodyParser from 'body-parser'
import helmet from 'helmet';
import { terminate } from './util/error';
import * as morgan from 'morgan'
import { logger } from './util/logger';
import { ValidationError } from 'class-validator';
import { TrimPipe, responseHandler } from './util';
dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>
  (AppModule);
  app.use(morgan(function (tokens, req, res) {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms'
    ].join(' ')}, {stream: {
      write: function(message: any){
        logger.http(message);
        return true
      }
    }}))
  app.enableVersioning({
    type: VersioningType.URI,
    // prefix: "1"
  });
  app.use(helmet());
  app.enableCors();
  const config = new DocumentBuilder()
  .setTitle('Test Backend Api')
  .setDescription("Backend Api routes for Web and App")
  .setVersion('v1')
  .addBearerAuth(
    {
      description: `Please enter token in following format: JWT without Bearer`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header'
    },
    'Authorization', // This name here is important for matching up with @ApiBearerAuth() in your controller!
  )
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}))
  app.useGlobalPipes(new ValidationPipe({
    forbidUnknownValues: false,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      const result = validationErrors.map((error) => ({
        // field: error.property,
        // error: Object.values(error.constraints).join(', '),
        message: error.constraints[Object.keys(error.constraints)[0]]
      }))
      return responseHandler({
        status: false,
        statusCode: HttpStatus.BAD_REQUEST,
        message: result[0].message,
        data:{}
      });
    },
  }));
  app.useGlobalPipes(new TrimPipe())

  const port = process.env.PORT as any || 4000
  await app.listen(port, () => {
    logger.info(`Server started on port ${port}`)
  });

  const errorHandler = terminate(app)

  process.on('uncaughtException', errorHandler(1, 'Unexpected Error'))    //programmer error
  process.on('unhandledRejection', errorHandler(1, 'Unhandled Promise'))  //unhandled promise error
  process.on('SIGTERM', errorHandler(0, 'SIGTERM'))   //on a successful termination
  process.on('SIGINT', errorHandler(0, 'SIGINT')) //interrupted process
}
bootstrap();
