import { Interface } from 'ethers';

import { WEB3_CONFIG } from './addresses';

const aggIface = new Interface([
  'function latestRoundData() view returns (uint80,int256,uint256,uint256,uint80)',
]);

export async function getEthUsd(): Promise<number | null> {
  try {
    if (!WEB3_CONFIG.CHAINLINK_FEED_ADDRESS) return null;
    const { ethereum } = window as any;
    if (!ethereum) return null;
    const data = aggIface.encodeFunctionData('latestRoundData', []);
    const result = await ethereum.request({
      method: 'eth_call',
      params: [{ to: WEB3_CONFIG.CHAINLINK_FEED_ADDRESS, data }, 'latest'],
    });
    const decoded = aggIface.decodeFunctionResult('latestRoundData', result);
    const price = Number(decoded[1]);
    return Math.round((price / 1e8) * 100) / 100;
  } catch {
    return null;
  }
}

