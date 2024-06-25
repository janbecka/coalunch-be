/**
 * @file config.ts - Configuration file for the application. Contains all the configuration options for the application.
 */
export const CONF = {
    SERVER: {
        PORT: 3000,
        RUN_CRON: true,
    },

    LOGGER: {
        LOG_DIRECTORY: process.env.LOG_DIRECTORY || `${__dirname}/../../logs/`,
        LEVEL: 'debug',
        ERROR_FILENAME: 'customer-error-%DATE%.log',
        COMBINED_FILENAME: 'coalsoft-combined-%DATE%.log',
        DOUBLE_LOGS: false,
        CONSOLE_LOG: true,
        MAX_SIZE: '100m',
        MAX_FILES: '14d',
        DATE_PATTERN: 'YYYY-MM-DD',
        PROJECT: 'coalshift-be',
        ZIPPED_ARCHIVE: false,
        HANDLE_EXCEPTIONS: true,
    },

    USE_PROXY: process.env.USE_PROXY === 'true' ? true : false,
    PROXY: {
        host: process.env.PROXY_HOST || 'localhost',
        port: Number(process.env.PROXY_PORT) || 8080,
        protocol: 'http',
    },
};
