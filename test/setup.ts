import { execSync } from "child_process";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

if (process.env.TEST_TYPE === "integration") {
  beforeAll(() => {
    execSync("npx prisma db push --force-reset");
  });

  beforeEach(async () => {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== "_prisma_migrations")
      .map((name) => `"public"."${name}"`)
      .join(", ");
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
    } catch (error) {
      console.log({ error });
    }
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
}
