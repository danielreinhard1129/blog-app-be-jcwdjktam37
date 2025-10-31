import { TransactionWorker } from "../modules/transaction/transaction.worker";

export const initWorkers = () => {
  // add other workers here
  new TransactionWorker();
};
