export type Token =
	| 'BTC'
	| 'ETH'
	| 'SOL'
	| 'USDC'
	| 'USDT'
	| 'PYTH'
	| 'JTO'
	| 'BONK'
	| 'HNT'
	| 'MOBILE'
	| 'WIF'
	| 'JUP'
	| 'RENDER'
	| 'WEN'
	| 'W'
	| 'TNSR'
	| 'PRCL'
	| 'SHARK'
	| 'KMNO'
	| 'MEW'
	| 'BOME'
	| 'RAY'
	| 'HONEY'
	| 'SHFL'
	| 'BODEN'
	| 'IO'
	| 'DRIFT'
	| 'PEPE'
	| 'SHIB'
	| 'LINK'
	| 'UNI'
	| 'ONDO'
	| 'FTM'
	| 'MATIC'
	| 'STRK'
	| 'BLUR'
	| 'WLD'
	| 'GALA'
	| 'NYAN'
	| 'HLG'
	| 'MON'
	| 'ZKJ'
	| 'MANEKI'
	| 'HABIBI'
	| 'UNA'
	| 'ZRO'
	| 'ZEX'
	| 'AAVE'
	| 'LDO'
	| 'MOTHER'
	| 'CLOUD'
	| 'MAX'
	| 'POL'
	| 'TRUMPWIN'
	| 'HARRISWIN'
	| 'MOODENG'
	| 'DBR'
	| 'GOAT'
	| 'ACT'
	| 'DOGE'
	| 'BCH'
	| 'LTC'
	| 'APE'
	| 'ENA'
	| 'ME'
	| 'EIGEN'
	| 'CHILLGUY'
	| 'PENGU'
	| 'EUR'
	| 'SONIC'
	| 'J'
	| 'TRUMP'
	| 'MELANIA'
	| 'ANIME'
	| 'XRP'
	| 'SUI'
	| 'VINE'
	| 'ADA'
	| 'MOVE'
	| 'BERA'
	| 'IP'
	| 'HYPE'
	| 'BNB'
	| 'KAITO'
	| 'PEPE1000'
	| 'BONK1000'
	| 'SHIB1000'
	| 'AVAX'
	| 'S'
	| 'POINTS';

export interface FillHistory {
	clientId: string;
	fee: string;
	feeSymbol: string;
	isMaker: boolean;
	orderId: string;
	price: string;
	quantity: string;
	side: 'Bid' | 'Ask';
	symbol: string;
	systemOrderType:
		| 'CollateralConversion'
		| 'FutureExpiry'
		| 'LiquidatePositionOnAdl'
		| 'LiquidatePositionOnBook'
		| 'LiquidatePositionOnBackstop'
		| 'OrderBookClosed';
	timestamp: string;
	tradeId: number;
}

export interface Balances {
	[key: string]: {
		available: string;
		locked: string;
		staked: string;
	};
}

export interface BorrowLendPosition {
	cumulativeInterest: string;
	id: string;
	imf: string;
	netQuantity: string;
	markPrice: string;
	mmf: string;
	netExposureQuantity: string;
	netExposureNotional: string;
	symbol: Token;
}

export interface OpenedLimitOrder {
	orderType: 'Limit' | 'StopLimit';
	id: string;
	clientId?: 0;
	createdAt: 0;
	executedQuantity: string;
	executedQuoteQuantity: string;
	postOnly: boolean;
	price: string;
	quantity: string;
	quoteQuantity: string;
	reduceOnly?: boolean;
	selfTradePrevention: 'RejectTaker' | 'RejectMaker' | 'RejectBoth';
	status:
		| 'Cancelled'
		| 'Expired'
		| 'Filled'
		| 'New'
		| 'PartiallyFilled'
		| 'TriggerPending'
		| 'TriggerFailed';
	side: 'Bid' | 'Ask';
	symbol: string;
	timeInForce: 'GTC' | 'IOC' | 'FOK';
	triggerPrice?: string;
	triggerQuantity?: string;
	triggeredAt?: number;
}

export interface OpenedMarketOrder {
	orderType: 'Market' | 'StopMarket';
	id: string;
	clientId?: 0;
	createdAt: 0;
	executedQuantity: string;
	executedQuoteQuantity: string;
	quantity?: string;
	quoteQuantity?: string;
	reduceOnly?: boolean;
	timeInForce: 'GTC' | 'IOC' | 'FOK';
	selfTradePrevention: 'RejectTaker' | 'RejectMaker' | 'RejectBoth';
	side: 'Bid' | 'Ask';
	status:
		| 'Cancelled'
		| 'Expired'
		| 'Filled'
		| 'New'
		| 'PartiallyFilled'
		| 'TriggerPending'
		| 'TriggerFailed';
	symbol: string;
	triggerPrice?: string;
	triggerQuantity?: string;
	triggeredAt?: number;
}

export interface Depth {
	asks: [string, string][];
	bids: [string, string][];
	lastUpdateId: string;
	timestamp: number;
}
