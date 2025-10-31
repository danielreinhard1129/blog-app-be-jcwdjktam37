import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { GetBlogsDTO } from "./dto/get-blogs.dto";
import { ApiError } from "../../utils/api-error";

export class BlogController {
  private blogService: BlogService;

  constructor() {
    this.blogService = new BlogService();
  }

  getBlogs = async (req: Request, res: Response) => {
    const query = plainToInstance(GetBlogsDTO, req.query);
    const result = await this.blogService.getBlogs(query);
    res.status(200).send(result);
  };

  createBlog = async (req: Request, res: Response) => {
    const body = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const thumbnail = files.thumbnail?.[0];
    if (!thumbnail) throw new ApiError("Thumbnail is required", 400);
    const authUserId = Number(res.locals.user.id);

    const result = await this.blogService.createBlog(
      body,
      thumbnail,
      authUserId
    );
    res.status(200).send(result);
  };
}
