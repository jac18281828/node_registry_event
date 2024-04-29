import * as fs from 'fs';
import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || '';
const RPC_URL = process.env.RPC_URL || '';
const ABI_FILE = process.env.ABI || '';
const EVENT_SIGNATURE = process.env.EVENT_SIGNATURE || '';
const PUBLIC_KEY = process.env.PUBLIC_KEY || '';
const FROM_BLOCK = process.env.FROM_BLOCK || '0';

async function getEventLog(contract: ethers.Contract, eventSignature: string) {
  const fromBlock = parseInt(FROM_BLOCK);

  const filter = {
    address: contract.address,
    fromBlock: fromBlock,
    toBlock: 'latest',
    topics: [ethers.utils.id(eventSignature)],
  };
  const logs = await contract.provider.getLogs(filter);
  return logs.map((log) => contract.interface.parseLog(log));
}

const run = async () => {
  try {
    checkEnvironmentVariables();
    const ABI = loadAbi(ABI_FILE);
    const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);
    const logs = await getEventLog(contract, EVENT_SIGNATURE);
    logs.forEach((log) => {
      if (PUBLIC_KEY && log.args['pubkey'].toLowerCase() !== PUBLIC_KEY.toLowerCase()) {
        return;
      }
      console.log(log);
    });
    console.log(logs.length + ' events found');
  } catch (error) {
    console.error(error);
    throw new Error('Error in event');
  }
};

run()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

function loadAbi(abiFile: string): [] {
  const abiData = fs.readFileSync(abiFile).toString();
  const abi = JSON.parse(abiData);
  return abi;
}

function checkEnvironmentVariables() {
  if (!CONTRACT_ADDRESS) {
    throw new Error('CONTRACT_ADDRESS is not set');
  }
  if (!RPC_URL) {
    throw new Error('RPC_URL is not set');
  }
  if (!ABI_FILE) {
    throw new Error('ABI is not set');
  }
  if (!EVENT_SIGNATURE) {
    throw new Error('EVENT_SIGNATURE is not set');
  }
}
