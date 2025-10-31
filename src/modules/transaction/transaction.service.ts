import { TransactionStatus } from "../../generated/prisma";
import { ApiError } from "../../utils/api-error";
import { CloudinaryService } from "../cloudinary/cloudinary.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDTO } from "./dto/create-transaction.dto";
import { GetTransactionsDTO } from "./dto/get-transactions.dto";
import { TransactionQueue } from "./transaction.queue";
import { Prisma } from "../../generated/prisma";

export class TransactionService {
  private prisma: PrismaService;
  private transactionQueue: TransactionQueue;
  private cloudinaryService: CloudinaryService;

  constructor() {
    this.prisma = new PrismaService();
    this.transactionQueue = new TransactionQueue();
    this.cloudinaryService = new CloudinaryService();
  }

  getTransactions = async (query: GetTransactionsDTO, authUserId: number) => {
    const { page, take, sortBy, sortOrder, search, status } = query;

    const whereClause: Prisma.TransactionWhereInput = {
      userId: authUserId,
    };

    if (search) {
      whereClause.uuid = { contains: search, mode: "insensitive" };
    }

    if (status) {
      whereClause.status = status;
    }

    const transactions = await this.prisma.transaction.findMany({
      where: whereClause,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * take,
      take: take,
      include: { user: { omit: { password: true } } },
    });

    const count = await this.prisma.transaction.count({
      where: whereClause,
    });

    return {
      data: transactions,
      meta: { page, take, total: count },
    };
  };

  createTransaction = async (
    body: CreateTransactionDTO,
    authUserId: number
  ) => {
    // 1. get all ticket IDs from body.payload
    const payload = body.payload; // [{ ticketId: 1, qty: 1 },{ ticketId: 2, qty: 2 }]
    const ticketIds = payload.map((item) => item.ticketId); // [1,2]

    // 2. fetch all tickes from DB based on ticket IDs
    const tickets = await this.prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
    });

    // 3. validate tickets availability
    for (const item of payload) {
      const ticket = tickets.find((ticket) => ticket.id === item.ticketId);

      if (!ticket) {
        throw new ApiError(`ticket with id ${item.ticketId} not found`, 400);
      }

      if (ticket.stock < item.qty) {
        throw new ApiError("insufficient stock", 400);
      }
    }

    const result = await this.prisma.$transaction(async (tx) => {
      // 4. create data transaction
      const transaction = await tx.transaction.create({
        data: { userId: authUserId },
      });

      // 5. create data transaction detail
      const transactionDetails = payload.map((item) => {
        const ticket = tickets.find((ticket) => ticket.id === item.ticketId)!;

        return {
          transactionId: transaction.id,
          ticketId: ticket.id,
          qty: item.qty,
          price: ticket.price,
        };
      });

      await tx.transactionDetail.createMany({
        data: transactionDetails,
      });

      // 6. decrement stock for each ticket
      for (const item of payload) {
        await tx.ticket.update({
          where: { id: item.ticketId },
          data: { stock: { decrement: item.qty } },
        });
      }

      return transaction;
    });

    // 7. TODO: send email untuk upload bukti bayar

    // 8. buat delay queue
    await this.transactionQueue.addNewTransaction(result.uuid);

    return { message: "create transaction success" };
  };

  uploadPaymentProof = async (
    uuid: string,
    paymentProof: Express.Multer.File,
    authUserId: number
  ) => {
    // cari dulu transaksi berdasarkan uuid
    const transaction = await this.prisma.transaction.findFirst({
      where: { uuid },
    });

    // kalo ga ada throw error
    if (!transaction) {
      throw new ApiError("invalid transaction uuid", 400);
    }

    // kalo ada cek juga userId di data transaksi sama tidak dengan authUserId dari isi token
    // kalo tidak sama throw error
    if (transaction.userId !== authUserId) {
      throw new ApiError("Forbidden", 403);
    }

    // hanya status transaksi tertentu yang bisa upload payment proof
    const allowedStatus: TransactionStatus[] = [
      "WAITING_FOR_PAYMENT",
      "WAITING_FOR_CONFIRMATION",
    ];
    if (!allowedStatus.includes(transaction.status)) {
      throw new ApiError("Invalid transaction status", 400);
    }

    // kalo udah ada paymentProof sebelumnya, dihapus dulu.
    if (transaction.paymentProof) {
      await this.cloudinaryService.remove(transaction.paymentProof);
    }

    // upload paymentProof ke cloudinary
    const { secure_url } = await this.cloudinaryService.upload(paymentProof);

    // update data status transaksi menjadi WAITING_FOR_CONFIRMATION & isi kolom payment
    // proof dengan secure_url dari cloudinary
    await this.prisma.transaction.update({
      where: { id: transaction.id },
      data: { status: "WAITING_FOR_CONFIRMATION", paymentProof: secure_url },
    });

    return { message: "upload payment proof success" };
  };

  acceptTransaction = async () => {};

  rejectTransaction = async () => {};
}
