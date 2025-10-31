import { Request, Response } from "express";
import { SampleService } from "./sample.service";

export class SampleController {
  private sampleService: SampleService;

  constructor() {
    this.sampleService = new SampleService();
  }

  getSamples = async (req: Request, res: Response) => {
    const result = await this.sampleService.getSamples();
    res.status(200).send(result);
  };

  getSample = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await this.sampleService.getSample(id);
    res.status(200).send(result);
  };

  createSample = async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const image = files.image?.[0];
    const result = await this.sampleService.createSample(req.body, image);
    res.status(200).send(result);
  };
}
