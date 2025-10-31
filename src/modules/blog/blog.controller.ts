import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { BlogService } from "./blog.service";
import { GetBlogsDTO } from "./dto/get-blogs.dto";

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
}
