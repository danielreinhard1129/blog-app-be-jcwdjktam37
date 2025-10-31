import { connection } from "../../config/redis";

export class RedisService {
  getValue = async (key: string) => {
    return await connection.get(key);
  };

  setValue = async (key: string, value: string, ttlInSeconds?: number) => {
    if (ttlInSeconds) {
      return await connection.set(key, value, "EX", ttlInSeconds);
    } else {
      return await connection.set(key, value);
    }
  };
}
