import mempoolJS from "@mempool/mempool.js";

const AVERAGE_TRANSACTION_VBYTE_SIZE = 250; // Average transaction size in vbytes - 1 input + 2 outputs
// This is a rough estimate and can vary based on the actual transaction structure

/**
 * Fetches the recommended transaction fee from Mempool.space.
 * Calculates the fee based on the average transaction size which has 1 input and 2 outputs.
 * @returns {Promise<number>} The recommended transaction fee in satoshis per vbyte.
 */
export const getTransactionFee = async () => {
  const {
    bitcoin: { fees },
  } = mempoolJS({
    hostname: "mempool.space",
  });

  const feesRecommended = await fees.getFeesRecommended();

  return feesRecommended.fastestFee * AVERAGE_TRANSACTION_VBYTE_SIZE;
};
