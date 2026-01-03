import pino from 'pino';

const getTransport = () => {
  if (process.env.LOGSTASH_HOST) {
    // production: logstash
    return {
      target: 'pino-socket',
      options: {
        address: process.env.LOGSTASH_HOST,
        port: parseInt(process.env.LOGSTASH_PORT || '5000'),
        mode: 'tcp',
        reconnect: true,
        reconnectTries: 10
      }
    };
  } else {
    // development
    return {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'yyyy.mm.dd HH:MM:ss',
        ignore: 'pid,hostname'
      }
    };
  }
};

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => ({ level: label })
  },
  base: {
    service: process.env.SERVICE_NAME || 'exterastore-server',
    environment: process.env.NODE_ENV || 'development'
  },
  transport: getTransport()
});

class Logger {
  private shouldLog: boolean;
  private logger: pino.Logger;

  constructor(shouldLog: boolean = true) {
    this.shouldLog = shouldLog;
    this.logger = pinoLogger;

    if (shouldLog) {
      this.logger.info('Logger session initialized');
    } else {
      console.log('[LOGS] No logs will be recorded for this session');
    }
  }

  info(message: string, data?: object) {
    if (!this.shouldLog) return;
    this.logger.info(data || {}, message);
  }

  error(message: string, error?: Error | object) {
    if (!this.shouldLog) return;
    if (error instanceof Error) {
      this.logger.error({ 
        error: error.message, 
        stack: error.stack 
      }, message);
    } else {
      this.logger.error(error || {}, message);
    }
  }

  warn(message: string, data?: object) {
    if (!this.shouldLog) return;
    this.logger.warn(data || {}, message);
  }

  debug(message: string, data?: object) {
    if (!this.shouldLog) return;
    this.logger.debug(data || {}, message);
  }

  fatal(message: string, error?: Error | object) {
    if (!this.shouldLog) return;
    if (error instanceof Error) {
      this.logger.fatal({ 
        error: error.message, 
        stack: error.stack 
      }, message);
    } else {
      this.logger.fatal(error || {}, message);
    }
  }
}

const logger = new Logger(
  process.env.DISABLE_LOGGING !== 'true'
);

export default logger;
