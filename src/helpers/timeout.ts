const GLOBAL_TIMEOUT = 10000; // 10 seconds
import createHttpError from "http-errors";

export const globalTimeoutRace = async (fn: Function) => {
    return await Promise.race([
        fn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(createHttpError(500, "timed out!")), GLOBAL_TIMEOUT) // timeout
        ),
      ]);
}