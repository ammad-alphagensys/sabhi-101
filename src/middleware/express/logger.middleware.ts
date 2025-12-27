import morgan from "morgan";
import winston from "winston";

const { combine, timestamp, json } = winston.format;

const logger = winston.createLogger({
  level: "http",
  format: combine(
    timestamp({
      format: "YYYY-MM-DD hh:mm:ss.SSS A",
    }),
    json(),
  ),
  transports: [new winston.transports.Console()],
});

export const loggerMiddleware = morgan(
  function (tokens: any, req, res) {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number.parseFloat(tokens.status(req, res) ?? ""),
      content_length: tokens.res(req, res, "content-length"),
      response_time: Number.parseFloat(tokens["response-time"](req, res) ?? ""),
    });
  },
  {
    stream: {
      // Configure Morgan to use our custom logger with the http severity
      write: (message: any) => {
        const data = JSON.parse(message);
        logger.http(`incoming-request`, data);
      },
    },
  },
);
