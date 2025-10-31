import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { Readable } from "stream";

export class CloudinaryService {
  constructor() {
    cloudinary.config({
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }

  private bufferToStream = (buffer: Buffer) => {
    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    return readable;
  };

  upload = (
    file: Express.Multer.File,
    folder?: string
  ): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
      const readableStream = this.bufferToStream(file.buffer);

      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (err, result) => {
          if (err) return reject(err);

          if (!result)
            return reject(new Error("Upload failed: No result returned"));

          resolve(result);
        }
      );

      readableStream.pipe(uploadStream);
    });
  };

  private extractPublicIdFromUrl = (url: string) => {
    const urlParts = url.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];
    return publicId;
  };

  remove = async (secureUrl: string) => {
    const publicId = this.extractPublicIdFromUrl(secureUrl);
    return await cloudinary.uploader.destroy(publicId);
  };
}
