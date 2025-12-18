import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { StoragePort } from '../../application/ports/out/storage.port';

/**
 * Supabase Storage adapter implementing the StoragePort interface.
 * Handles file operations for avatars, logos, and product images.
 */
@Injectable()
export class SupabaseStorageAdapter implements StoragePort {
  constructor(@Inject('SupabaseClient') private readonly supabase: SupabaseClient) {}

  
  async uploadFile(bucket: string, path: string, file: Buffer, mimeType: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: mimeType,
        upsert: true,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Failed to upload file to ${bucket}/${path}: ${error.message}`);
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file from ${bucket}/${path}: ${error.message}`);
    }
  }

 
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

 
  predictUrl(bucket: string, path: string): string {
   
    const supabaseUrl = process.env.SUPABASE_URL;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }
}