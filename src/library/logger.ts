import winston, { format } from "winston";

/*  INFO: DESTRUCTURING_NECESSARY_COMPONENTS_FROM_WINSTON */
const { combine, colorize, timestamp, printf } = format;

/**
 *  INFO: INITIALIZES_A_WINSTON_LOGGER_INSTANCE_FOR_LOGGING_MESSAGES_TO_THE_CONSOLE.
 *
 * This method creates a logger instance with customizable log levels,
 * colorized output for better readability, and timestamps in the format
 * of "hh:mm A" (e.g., "02:30 PM"). It prints log messages in the format
 * "[timestamp] level: message" to the console.
 *
 * @remarks
 * The logger is configured to use the log level specified by the `LOG_LEVEL`
 * environment variable or defaults to "info" if not set. It only uses the
 * console transport for logging at this stage.
 *
 * @returns An initialized Winston logger instance configured to log messages to the console.
 */
export const winsLogger = winston.createLogger({
  /*  INFO: CONFIGURING_LOG_LEVEL, DEFAULTING_TO_"INFO" */
  level: process.env.LOG_LEVEL || "info",

  format: combine(
    /*  INFO: COLORIZING_ALL_LOG_LEVELS */
    colorize({ all: true }),

    /*  INFO: ADDING_TIMESTAMP_TO_LOGS_WITH_A_SPECIFIED_FORMAT */
    timestamp({
      format: "hh:mm A", // EXAMPLE_FORMAT: "02:30 PM"
    }),

    /* CUSTOM_LOG_MESSAGE_FORMAT_USING_"printf" */
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`),
  ),

  /*  INFO: CONFIGURING_TRANSPORTS */
  transports: [new winston.transports.Console()],
});
