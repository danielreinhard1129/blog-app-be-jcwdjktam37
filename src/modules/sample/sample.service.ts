import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { MailService } from "../mail/mail.service";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { CreateSampleDTO } from "./dto/create-sample.dto";

export class SampleService {
  private prisma: PrismaService;
  private cloudinaryService: CloudinaryService;
  private mailService: MailService;
  private redisService: RedisService;

  constructor() {
    this.prisma = new PrismaService();
    this.cloudinaryService = new CloudinaryService();
    this.mailService = new MailService();
    this.redisService = new RedisService();
  }

  getSamples = async () => {
    const cachedSamples = await this.redisService.getValue("samples");

    if (cachedSamples) {
      console.log("INI DATA SAMPLES DARI REDIS");
      return JSON.parse(cachedSamples);
    }

    const samples = await this.prisma.sample.findMany();

    console.log("INI DATA SAMPLES DARI DATABASE");
    await this.redisService.setValue("samples", JSON.stringify(samples), 20);

    return samples;
  };

  getSample = async (id: number) => {
    const sample = await this.prisma.sample.findFirst({
      where: { id },
    });

    if (!sample) {
      throw new ApiError("sample not found", 404);
    }

    return sample;
  };

  createSample = async (
    body: CreateSampleDTO,
    newImage?: Express.Multer.File
  ) => {
    let image = null;

    if (newImage) {
      const { secure_url } = await this.cloudinaryService.upload(newImage);
      image = secure_url;
    }

    await this.prisma.sample.create({
      data: { ...body, image },
    });

    await this.mailService.sendEmail(
      "nimiti8953@fixwap.com", // to
      "Welcome!", // subject
      "welcome", // template filename
      { message: "Welcomeeeeeeeee!" } // context
    );

    return { message: "create sample success" };
  };
}
