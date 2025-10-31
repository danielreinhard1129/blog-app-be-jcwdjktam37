import { Queue } from "bullmq";
import { connection } from "../../config/redis";

export class TransactionQueue {
  private queue: Queue;

  constructor() {
    this.queue = new Queue("transactionQueue", { connection: connection });
  }

  addNewTransaction = async (uuid: string) => {
    return await this.queue.add(
      "newTransaction",
      { uuid: uuid },           // payload / isi data dalam queue/antrian
      {
        jobId: uuid,            // optional: mencegah duplikat queue
        delay: 15 * 60 * 1000,  // optional: delay queue 2 menit
        attempts: 5,            // optional: retry sampai 5x
        removeOnComplete: true, // optional: hapus data setelah selesai
        backoff: { type: "exponential", delay: 1000 },
      }
    );
  };
}
