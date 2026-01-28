import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";

interface TelegramMessage {
	id: number;
	date: Date;
	message: string;
	views?: number;
	// Добавьте поля по необходимости
}

const apiId = YOUR_API_ID; // number
const apiHash = "YOUR_API_HASH"; // string
const stringSession = new StringSession(""); // Сохранит сессию

const client = new TelegramClient(stringSession, apiId, apiHash, {});

(async () => {
	await client.start({
		phoneNumber: async () => "+your_phone",
		password: async () => "2fa_password", // Если включено
		phoneCode: async () => "code_from_sms",
		onError: (err) => console.log(err),
	});
	console.log("Авторизован");

	// Получите entity канала (если не знаете ID)
	const channel = await client.getEntity("https://t.me/XS6GEcz5ZXMu82UvXQc");

	// Загрузите последние 100 сообщений
	const messagesRaw = await client.getMessages(channel, { limit: 100 });

	const messages: TelegramMessage[] = messagesRaw
		.map((msg) => ({
			id: msg.id,
			date: msg.date,
			message: msg.message ?? "",
			views: msg.views,
		}))
		.filter((m) => m.message);

	console.log(messages.slice(0, 5));
})();
