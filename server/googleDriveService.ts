import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.metadata.readonly'
];

export class GoogleDriveService {
  private drive: any;
  private oauth2Client: OAuth2Client;

  constructor(accessToken: string) {
    this.oauth2Client = new OAuth2Client();
    this.oauth2Client.setCredentials({ access_token: accessToken });
    this.drive = google.drive({ version: 'v3', auth: this.oauth2Client });
  }

  async ensureAppFolder(): Promise<string> {
    try {
      // Check if Indoor Jungle folder exists
      const response = await this.drive.files.list({
        q: "name='Indoor Jungle' and mimeType='application/vnd.google-apps.folder' and trashed=false",
        fields: 'files(id, name)',
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      // Create the folder if it doesn't exist
      const folderResponse = await this.drive.files.create({
        requestBody: {
          name: 'Indoor Jungle',
          mimeType: 'application/vnd.google-apps.folder',
          description: 'Plant care data and photos from Indoor Jungle app',
        },
        fields: 'id',
      });

      return folderResponse.data.id;
    } catch (error) {
      console.error('Error ensuring app folder:', error);
      throw new Error('Failed to access Google Drive folder');
    }
  }

  async savePlantData(plantData: any, folderId: string): Promise<void> {
    try {
      const fileName = 'plant_data.json';
      
      // Check if file already exists
      const existingFile = await this.drive.files.list({
        q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
        fields: 'files(id)',
      });

      const fileContent = JSON.stringify(plantData, null, 2);
      const media = {
        mimeType: 'application/json',
        body: fileContent,
      };

      if (existingFile.data.files && existingFile.data.files.length > 0) {
        // Update existing file
        await this.drive.files.update({
          fileId: existingFile.data.files[0].id,
          media,
        });
      } else {
        // Create new file
        await this.drive.files.create({
          requestBody: {
            name: fileName,
            parents: [folderId],
            description: 'Plant care data from Indoor Jungle app',
          },
          media,
        });
      }
    } catch (error) {
      console.error('Error saving plant data:', error);
      throw new Error('Failed to save plant data to Google Drive');
    }
  }

  async loadPlantData(folderId: string): Promise<any> {
    try {
      const fileName = 'plant_data.json';
      
      const fileList = await this.drive.files.list({
        q: `name='${fileName}' and parents in '${folderId}' and trashed=false`,
        fields: 'files(id)',
      });

      if (!fileList.data.files || fileList.data.files.length === 0) {
        return { plants: [], logs: {} };
      }

      const fileId = fileList.data.files[0].id;
      const response = await this.drive.files.get({
        fileId,
        alt: 'media',
      });

      return JSON.parse(response.data);
    } catch (error) {
      console.error('Error loading plant data:', error);
      // Return empty data structure instead of throwing
      return { plants: [], logs: {} };
    }
  }

  async uploadPlantImage(imageBuffer: Buffer, imageName: string, folderId: string): Promise<string> {
    try {
      const response = await this.drive.files.create({
        requestBody: {
          name: imageName,
          parents: [folderId],
          description: 'Plant photo from Indoor Jungle app',
        },
        media: {
          mimeType: 'image/jpeg',
          body: imageBuffer,
        },
        fields: 'id, webViewLink',
      });

      // Make the file publicly viewable
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Return a direct image URL
      return `https://drive.google.com/uc?id=${response.data.id}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image to Google Drive');
    }
  }

  async deletePlantImage(imageUrl: string): Promise<void> {
    try {
      // Extract file ID from Google Drive URL
      const match = imageUrl.match(/[?&]id=([^&]+)/);
      if (!match) return;

      const fileId = match[1];
      await this.drive.files.delete({ fileId });
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error for deletion failures
    }
  }
}

export default GoogleDriveService;