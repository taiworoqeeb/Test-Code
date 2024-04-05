import { createLogger, format, transports, addColors } from 'winston';
import 'winston-mongodb';
import * as dotenv from "dotenv"
dotenv.config()


const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
}

addColors(colors)

const logger = createLogger({
    transports: [
        process.env.NODE_ENV == "production" ?
        new transports.MongoDB({
            level: 'error',
            //mongo database connection link
            db : `${process.env.DATABASE_URL}`,
            options: {
                useUnifiedTopology: true
            },
            // A collection to save json formatted logs
            collection: 'server_logs',
            format: format.combine(
            format.timestamp(),
            format.metadata(),

            // Convert logs to a json format
            format.json())
        }) :
        new transports.Console({
            level: 'debug',
            format: format.combine(
                format.colorize({all: true, colors: colors, level: true, message: true}),
                format.timestamp({
                    format: 'DD/MM/YYYY, HH:mm:ss'
                }),
                format.metadata(),
                format.align(),
                format.prettyPrint({
                    colorize: true,
                    depth: 10
                }),
                format.printf(info => `[Nest] ${info.level}  - ${info.metadata.timestamp}  ${info.message}${ info.metadata.message ? ' - ' + info.metadata.message : ''}${ info.metadata.label ? ' - ' + info.metadata.label : ''}`),
              ),
            handleExceptions: true,
            // json: false,
            // colorize: true
        })
    ],
    exitOnError: false
});

// const myStream = logger.stream({
//     write: function(message: any){
//        logger.http(message);
//     }
// });

export{ logger };
