import chalk from 'chalk';
import dotenv from 'dotenv';
import readline from 'readline';

import Backpack from './lib/client';
import type { Depth } from './lib/types';
import { formatCurrency, randInt, sleep } from './utils';

dotenv.config();
const { BACKPACK_API_SECRET } = process.env;
if (!BACKPACK_API_SECRET) throw new Error('BACKPACK_API_SECRET not found');

const randomizationConfigs: {
	[key: number]: { qty: number[]; sleep: number[] };
} = {
	0: { qty: [0, 0], sleep: [0, 0] },
	1: { qty: [0, 5], sleep: [500, 1000] },
	2: { qty: [0, 10], sleep: [750, 1250] },
	3: { qty: [5, 15], sleep: [1000, 1500] },
	4: { qty: [5, 20], sleep: [1000, 2000] },
	5: { qty: [10, 25], sleep: [1250, 2250] },
	6: { qty: [10, 30], sleep: [1500, 2500] },
	7: { qty: [15, 35], sleep: [1750, 2750] },
	8: { qty: [20, 40], sleep: [2000, 3000] },
	9: { qty: [25, 50], sleep: [2250, 3500] },
	10: { qty: [40, 90], sleep: [3000, 5000] },
};

const getRandomQuantity = (max: number, level: number) => {
	const [minPercent, maxPercent] = randomizationConfigs[level].qty;
	const reduction = randInt(minPercent, maxPercent) / 100;
	return Math.floor(max * (1 - reduction)).toString();
};

const getRandomSleep = (level: number) => {
	const [min, max] = randomizationConfigs[level].sleep;
	return randInt(min, max);
};

const getPriceFromDepth = (depth: Depth, side: 'Ask' | 'Bid') =>
	side === 'Ask'
		? depth.bids.map(i => i[0]).sort((a, b) => parseFloat(b) - parseFloat(a))[0]
		: depth.asks
				.map(i => i[0])
				.sort((a, b) => parseFloat(a) - parseFloat(b))[0];

async function tradingLoop(
	backpack: Backpack,
	pair: string,
	initialBalance: number,
	level: number,
) {
	let bidBalance = initialBalance;
	let askBalance = '';
	let totalVolume = 0;
	let side: 'Ask' | 'Bid' = 'Bid';

	for (let i = 1; i <= Infinity; i++) {
		const depth = await backpack.getDepth(pair);
		const price = getPriceFromDepth(depth, side);
		const quantity =
			side === 'Bid' ? getRandomQuantity(bidBalance, level) : askBalance;

		const order = await backpack.executeOrder('Limit', side, pair, {
			autoBorrow: false,
			autoBorrowRepay: false,
			autoLend: false,
			autoLendRedeem: true,
			postOnly: false,
			quantity,
			price,
		});
		if (order.status === 'Filled') askBalance = order.quantity!;
		else {
			console.warn(`❌ #${i} Order not filled, canceling...`);
			await backpack.cancelOrder(order.symbol, order.id!);
			continue;
		}

		totalVolume += parseFloat(quantity);
		const coloredSide = side === 'Bid' ? chalk.green(side) : chalk.red(side);
		console.log(
			`💰 #${i} ${coloredSide} ${quantity} at ${price}`,
			'|',
			`🤑Total volume: ${formatCurrency(totalVolume)}`,
		);
		bidBalance *= 0.999;
		side = side === 'Bid' ? 'Ask' : 'Bid';
		const sleepTime = getRandomSleep(level);
		if (sleepTime) await sleep(sleepTime);
	}
}

async function main() {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	const backpack = new Backpack(BACKPACK_API_SECRET!);

	rl.question('Enter token (e.g. BTC): ', token => {
		token = token.toUpperCase() + '_USDC';
		rl.question('Enter initial balance: ', balance => {
			rl.question(
				'Select randomization level (0-10, 0=none, 1=low, 10=high): ',
				(level: string | number) => {
					level = Math.max(0, Math.min(10, parseInt(level as string) || 0));
					rl.close();
					tradingLoop(backpack, token, parseFloat(balance), level);
				},
			);
		});
	});
}

main();
