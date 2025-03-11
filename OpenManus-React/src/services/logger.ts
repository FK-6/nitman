type LogLevel = 'info' | 'warning' | 'error';
type LogHandler = (message: string, level: LogLevel) => void;

class Logger {
  private handlers: LogHandler[] = [];

  addHandler(handler: LogHandler) {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  info(message: string) {
    this.log(message, 'info');
  }

  warning(message: string) {
    this.log(message, 'warning');
  }

  error(message: string) {
    this.log(message, 'error');
  }

  private log(message: string, level: LogLevel) {
    this.handlers.forEach(handler => handler(message, level));
  }
}

export const logger = new Logger();
