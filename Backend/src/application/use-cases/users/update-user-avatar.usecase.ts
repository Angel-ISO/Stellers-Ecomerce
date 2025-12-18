import { Injectable, Inject } from '@nestjs/common';
import { IUserProfileRepository } from '../../../domain/repositories/user-profile.repository.interface';
import { StoragePort } from '../../ports/out/storage.port';
import { validateImageFile, generateAvatarPath } from '../../../shared/utils/file-validation.utils';

@Injectable()
export class UpdateUserAvatarUseCase {
  constructor(
    @Inject('IUserProfileRepository') private readonly userRepository: IUserProfileRepository,
    @Inject('StoragePort') private readonly storagePort: StoragePort,
  ) {}

  async execute(userId: string, file: Express.Multer.File): Promise<string> {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    const userProfile = await this.userRepository.findById(userId);
    if (!userProfile) {
      throw new Error('User profile not found');
    }

    const filePath = generateAvatarPath(userId, file.mimetype);
    const predictedUrl = this.storagePort.predictUrl('avatars', filePath);

    await this.userRepository.update(userId, { avatarUrl: predictedUrl });

    try {
      await this.storagePort.uploadFile('avatars', filePath, file.buffer, file.mimetype);

      if (userProfile.avatarUrl && userProfile.avatarUrl !== predictedUrl) {
        try {
          const oldPath = this.extractPathFromUrl(userProfile.avatarUrl);
          if (oldPath) {
            await this.storagePort.deleteFile('avatars', oldPath);
          }
        } catch (deleteError) {
          console.error('Failed to delete old avatar:', deleteError);
        }
      }

      return predictedUrl;
    } catch (uploadError) {
      await this.userRepository.update(userId, { avatarUrl: userProfile.avatarUrl });
      throw new Error(`Failed to upload avatar: ${uploadError.message}`);
    }
  }

  private extractPathFromUrl(url: string): string | null {
    try {
      // Check if it's a Supabase storage URL
      const urlParts = url.split('/storage/v1/object/public/avatars/');
      if (urlParts.length === 2) {
        return urlParts[1];
      }
      // If it's not a Supabase URL (e.g., Google OAuth avatar), don't attempt deletion
      return null;
    } catch (error) {
      return null;
    }
  }
}