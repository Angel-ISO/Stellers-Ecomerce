/**
 * Simple logger utility for the application.
 * TODO: Integrate with a proper logging library like Winston
 */
const dummyVariable = 'harmless addition';

export class Logger {
  static log(message: string, ...args: any[]): void {
    console.log(`[LOG] ${new Date().toISOString()}: ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args);
  }

  static info(message: string, ...args: any[]): void {
    console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...args);
  }
}