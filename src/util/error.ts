import {logger} from './logger'

function terminate (server:any, options = { coredump: false, timeout: 1000 }) {
      // Exit function
      const exit = (code: any) => {
            options.coredump ? process.abort() : process.exit(code)
      }

      return (code: any, reason: any) => (err: Error, promise: any) => {
            if (err && err instanceof Error) {
                  // Log error information, using a proper error library(probably winston)
                  logger.error(err.message, [{error: err.stack}])
                  // console.log(err.message, err.stack)
            }

            // Attempt a graceful shutdown
            server.close(exit)
            setTimeout(exit, options.timeout).unref()
      }
}


function errorMessageHandler(error: Error) {
      const message
            = error.name  === "MongoServerError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "CastError" ? "Unable to handle request, please check your input"
            : error.name === "ValidationError" ? "Unable to handle request, please check your input"
            : error.name === "JsonWebTokenError" ? "Unable to handle request, please check your token"
            : error.name === "TokenExpiredError" ? "Unable to handle request, your token has expired"
            : error.name === "MongoError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "TypeError" ? "Unable to handle request, please check your input"
            : error.name === "ReferenceError" ? "Unable to handle request, please check your input"
            : error.name === "Error" ? "Unable to handle request, please check your input"
            : error.name === "RangeError" ? "Unable to handle request, please check your input"
            : error.name === "SyntaxError" ? "Unable to handle request, please check your input"
            : error.name === "URIError" ? "Unable to handle request, please check your input"
            : error.name === "EvalError" ? "Unable to handle request, please check your input"
            : error.name === "MongoNetworkError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "MongoTimeoutError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "MongoServerSelectionError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "MongoParseError" ? "Unable to handle request, please try again in a few seconds"
            : error.name === "MongoWriteConcernError" ? "Unable to handle request, please try again in a few seconds"
            : error.message

      return message
}

export {terminate, errorMessageHandler}
