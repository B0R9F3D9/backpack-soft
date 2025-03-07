import { utf8ToBytes } from '@noble/curves/abstract/utils';
import { ed25519 } from '@noble/curves/ed25519';
import { base64 } from '@scure/base';
import axios, {
	AxiosError,
	type AxiosInstance,
	type AxiosRequestHeaders,
	type AxiosResponse,
} from 'axios';

import type {
	Balances,
	BorrowLendPosition,
	Depth,
	FillHistory,
	OpenedLimitOrder,
	OpenedMarketOrder,
	Token,
} from './types';

interface Headers extends AxiosRequestHeaders {
	'X-API-KEY': string;
	'X-TIMESTAMP': string;
	'X-WINDOW': string;
	'Content-Type': string;
	'X-SIGNATURE': string;
}

interface RequestParams {
	[key: string]: string | number | boolean | undefined;
}

class BaseClient {
	protected readonly API_URL: string = 'https://api.backpack.exchange/';
	protected axiosInstance: AxiosInstance;

	constructor() {
		this.axiosInstance = axios.create({
			baseURL: this.API_URL,
		});
	}

	private async makePublicRequest<T>(
		uri: string,
		params: RequestParams = {},
	): Promise<T> {
		try {
			const response: AxiosResponse<T> = await this.axiosInstance.get<T>(uri, {
				params,
			});
			return response.data;
		} catch (error) {
			if (error instanceof AxiosError) {
				const status = error.response?.status;
				const message = error.response?.data?.message || error.message;
				throw new Error(
					`API request failed: ${status ? `Status ${status} - ` : ''}${message}`,
				);
			}
			throw new Error(
				`Unexpected error during API request: ${(error as Error).message}`,
			);
		}
	}

	async getDepth(symbol: string) {
		return this.makePublicRequest<Depth>('/api/v1/depth', {
			symbol,
		});
	}
}

export default class Backpack extends BaseClient {
	private privateKey: Uint8Array = new Uint8Array();
	private publicKeyB64: string = '';

	constructor(apiSecret: string) {
		super();
		if (!apiSecret) {
			throw new Error('API secret not found');
		}
		this.privateKey = base64.decode(apiSecret);
		const publicKey = ed25519.getPublicKey(this.privateKey);
		this.publicKeyB64 = base64.encode(publicKey);
	}

	private signRequest(instruction: string, body: RequestParams = {}): Headers {
		const timestamp = Math.floor(Date.now()).toString();
		const window = '5000';

		const params: RequestParams = { instruction };

		if (Object.keys(body).length > 0) {
			Object.assign(params, Object.fromEntries(Object.entries(body).sort()));
		}

		params.timestamp = timestamp;
		params.window = window;

		const messageStr = new URLSearchParams(
			params as Record<string, string>,
		).toString();
		const messageBytes = utf8ToBytes(messageStr);
		const signature = ed25519.sign(messageBytes, this.privateKey);
		const signatureB64 = base64.encode(signature);

		return {
			'X-API-KEY': this.publicKeyB64,
			'X-TIMESTAMP': timestamp,
			'X-WINDOW': window,
			'Content-Type': 'application/json',
			'X-SIGNATURE': signatureB64,
		} as Headers;
	}

	private async makeAuthRequest<T>(
		method: 'get' | 'post' | 'delete',
		uri: string,
		instruction: string,
		paramsOrData: RequestParams = {},
	): Promise<T> {
		try {
			const headers = this.signRequest(instruction, paramsOrData);
			let response: AxiosResponse<T>;

			if (method === 'get') {
				response = await this.axiosInstance.get<T>(uri, {
					headers,
					params: paramsOrData,
				});
			} else if (method === 'post') {
				response = await this.axiosInstance.post<T>(uri, paramsOrData, {
					headers,
				});
			} else if (method === 'delete') {
				response = await this.axiosInstance.delete<T>(uri, {
					headers,
					data: paramsOrData,
				});
			} else {
				throw new Error(`Unsupported HTTP method: ${method}`);
			}

			return response.data;
		} catch (error) {
			if (error instanceof AxiosError) {
				const status = error.response?.status;
				const message = error.response?.data?.message || error.message;
				throw new Error(
					`API request failed: ${status ? `Status ${status} - ` : ''}${message}`,
				);
			}
			throw new Error(
				`Unexpected error during API request: ${(error as Error).message}`,
			);
		}
	}

	async getBalances() {
		return this.makeAuthRequest<Balances>(
			'get',
			'/api/v1/capital',
			'balanceQuery',
		);
	}

	async getFillHistory(
		marketType:
			| 'SPOT'
			| 'PERP'
			| 'IPERP'
			| 'DATED'
			| 'PREDICTION'
			| 'RFQ' = 'SPOT',
		limit = 100,
		offset = 0,
	) {
		return this.makeAuthRequest<FillHistory[]>(
			'get',
			'/wapi/v1/history/fills',
			'fillHistoryQueryAll',
			{ marketType, limit, offset },
		);
	}

	async getBorrowLendPositions() {
		return this.makeAuthRequest<BorrowLendPosition[]>(
			'get',
			'/api/v1/borrowLend/positions',
			'borrowLendPositionQuery',
		);
	}

	async executeBorrowLend(
		quantity: string,
		side: 'Borrow' | 'Lend',
		symbol: Token,
	) {
		return this.makeAuthRequest<void>(
			'post',
			'/api/v1/borrowLend',
			'borrowLendExecute',
			{
				quantity,
				side,
				symbol,
			},
		);
	}

	async getOpenOrders(symbol?: string, marketType?: 'SPOT' | 'PERP') {
		return this.makeAuthRequest<OpenedLimitOrder[] | OpenedMarketOrder[]>(
			'get',
			'/api/v1/orders',
			'orderQueryAll',
			symbol || marketType ? { symbol, marketType } : {},
		);
	}

	async executeOrder(
		orderType: 'Market' | 'Limit' | 'StopMarket' | 'StopLimit',
		side: 'Bid' | 'Ask',
		symbol: string,
		options?: {
			autoLend?: boolean;
			autoLendRedeem?: boolean;
			autoBorrow?: boolean;
			autoBorrowRepay?: boolean;
			clientId?: number;
			postOnly?: boolean;
			price?: string;
			quantity?: string;
			quoteQuantity?: string;
			reduceOnly?: boolean;
			selfTradePrevention?: 'RejectTaker' | 'RejectMaker' | 'RejectBoth';
			timeInForce?: 'GTC' | 'IOC' | 'FOK';
			triggerPrice?: string;
			triggerQuantity?: string;
		},
	) {
		return this.makeAuthRequest<OpenedLimitOrder | OpenedMarketOrder>(
			'post',
			'/api/v1/order',
			'orderExecute',
			{ orderType, side, symbol, ...options },
		);
	}

	async getRewards(status: string = 'claimed', limit = 100, offset = 0) {
		return this.makeAuthRequest(
			'get',
			'/wapi/v1/user/rewards',
			'userRewardsQuery',
			{ status, limit, offset },
		);
	}
}
