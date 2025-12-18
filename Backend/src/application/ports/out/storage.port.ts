export interface StoragePort {
  uploadFile(bucket: string, path: string, file: Buffer, mimeType: string): Promise<void>;
  deleteFile(bucket: string, path: string): Promise<void>;
  getPublicUrl(bucket: string, path: string): string;
  predictUrl(bucket: string, path: string): string;
}