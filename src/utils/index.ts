export async function sleep(ms: number) {
	const seconds = ms / 1000;
	console.log(`⏳ Sleeping for ${seconds.toLocaleString()}s...`);
	return new Promise(resolve => setTimeout(resolve, ms));
}

export function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function formatCurrency(amount: number): string {
	return amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
