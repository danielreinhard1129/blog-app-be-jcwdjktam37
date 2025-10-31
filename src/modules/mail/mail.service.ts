import { Transporter, createTransport } from "nodemailer";
import { MAIL_PASS, MAIL_USER } from "../../config/env";
import path from "path";
import fs from "fs/promises";
import handlebars from "handlebars";

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  private renderTemplate = async (templateName: string, context: any) => {
    const templateDir = path.resolve(__dirname, "./templates");

    const templatePath = path.join(templateDir, `${templateName}.hbs`);

    const templateSource = await fs.readFile(templatePath, "utf-8");

    const compiledTemplate = handlebars.compile(templateSource);

    return compiledTemplate(context);
  };

  sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    context: any
  ) => {
    const html = await this.renderTemplate(templateName, context);

    await this.transporter.sendMail({
      to: to,
      subject: subject,
      html: html,
    });
  };
}
