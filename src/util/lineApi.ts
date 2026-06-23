import type { LineIdTokenPayload } from "../types";

const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";
const LINE_NOTIFIER_TOKEN_URL = "https://api.line.me/message/v3/notifier/token";
const LINE_NOTIFIER_SEND_URL =
	"https://api.line.me/message/v3/notifier/send?target=service";

/**
 * IDトークンをLINEサーバーで検証し、ペイロードを取得
 * aud (channel ID) が自分のチャネルと一致するかも検証
 */
export const verifyIdToken = async (params: {
	idToken: string;
	channelId: string;
}): Promise<LineIdTokenPayload> => {
	const body = new URLSearchParams({
		id_token: params.idToken,
		client_id: params.channelId,
	});

	const res = await fetch(LINE_VERIFY_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(
			`LINE ID token verification failed: ${res.status} ${error}`,
		);
	}

	const payload = (await res.json()) as LineIdTokenPayload;

	if (payload.aud !== params.channelId) {
		throw new Error(
			`Channel ID mismatch: expected ${params.channelId}, got ${payload.aud}`,
		);
	}

	return payload;
};

/**
 * サービス通知トークンを発行する
 * クライアントの LIFF アクセストークンを入力に、サーバーが発行する。
 * @see https://developers.line.biz/ja/docs/line-mini-app/develop/service-messages/
 */
export const issueNotifierToken = async (params: {
	liffAccessToken: string;
	channelAccessToken: string;
}): Promise<string> => {
	const res = await fetch(LINE_NOTIFIER_TOKEN_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${params.channelAccessToken}`,
		},
		body: JSON.stringify({ liffAccessToken: params.liffAccessToken }),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`notifier/token failed: ${res.status} ${error}`);
	}

	const data = (await res.json()) as { notificationToken: string };
	return data.notificationToken;
};

/**
 * サービスメッセージを送信する
 * 文面は事前登録したテンプレート（templateName + params）を使う。
 */
export const sendServiceMessage = async (params: {
	notificationToken: string;
	templateName: string;
	params: Record<string, string>;
	channelAccessToken: string;
}): Promise<void> => {
	const res = await fetch(LINE_NOTIFIER_SEND_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${params.channelAccessToken}`,
		},
		body: JSON.stringify({
			templateName: params.templateName,
			params: params.params,
			notificationToken: params.notificationToken,
		}),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`notifier/send failed: ${res.status} ${error}`);
	}
};
