const logger = {
  info: (message, meta = '') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO]: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  warn: (message, meta = '') => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN]: ${message}`, meta ? JSON.stringify(meta) : '');
  },
  error: (message, meta = '') => {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR]: ${message}`, meta ? JSON.stringify(meta) : '');
  },
};

module.exports = logger;
