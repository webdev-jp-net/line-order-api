import type { LineTokenResponse, LineIdTokenPayload } from "../types";

const LINE_TOKEN_URL = "https://api.line.me/oauth2/v2.1/token";
const LINE_VERIFY_URL = "https://api.line.me/oauth2/v2.1/verify";

/**
 * 認可コードからアクセストークン + IDトークンを取得
 * client_secret はサーバー側のみで使用
 */
export const issueToken = async (params: {
	code: string;
	channelId: string;
	channelSecret: string;
	redirectUri: string;
}): Promise<LineTokenResponse> => {
	const body = new URLSearchParams({
		grant_type: "authorization_code",
		code: params.code,
		redirect_uri: params.redirectUri,
		client_id: params.channelId,
		client_secret: params.channelSecret,
	});

	const res = await fetch(LINE_TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: body.toString(),
	});

	if (!res.ok) {
		const error = await res.text();
		throw new Error(`LINE token issuance failed: ${res.status} ${error}`);
	}

	return res.json() as Promise<LineTokenResponse>;
};

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
