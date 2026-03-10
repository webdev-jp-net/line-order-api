import type { Context } from "hono";
import type { Env } from "../../types";
import { updateProfile } from "@util/userStore";

const VALID_GENDER = [0, 1, 2];
const VALID_AGE_GROUP = [0, 1, 2, 3, 4, 5, 6];
const RESIDENCE_PATTERN = /^(0[1-9]|[1-3][0-9]|4[0-7])$/;

/**
 * PUT /profile
 * ユーザープロフィール登録・更新
 */
export const putProfileHandler = async (c: Context<Env>) => {
	const lineUserId = c.get("lineUserId");

	let body: { gender?: number; ageGroup?: number; residence?: string };
	try {
		body = await c.req.json();
	} catch {
		return c.json({ message: "Bad Request", errorParams: ["body"] }, 400);
	}

	const errorParams: string[] = [];

	if (body.gender === undefined || !VALID_GENDER.includes(body.gender)) {
		errorParams.push("gender");
	}
	if (
		body.ageGroup === undefined ||
		!VALID_AGE_GROUP.includes(body.ageGroup)
	) {
		errorParams.push("ageGroup");
	}
	if (!body.residence || !RESIDENCE_PATTERN.test(body.residence)) {
		errorParams.push("residence");
	}

	if (errorParams.length > 0) {
		return c.json({ message: "Bad Request", errorParams }, 400);
	}

	try {
		const updated = await updateProfile(c.env.KV, lineUserId, {
			gender: body.gender as number,
			ageGroup: body.ageGroup as number,
			residence: body.residence as string,
		});

		return c.json({
			lineUserId: updated.lineUserId,
			gender: updated.gender,
			ageGroup: updated.ageGroup,
			residence: updated.residence,
		});
	} catch (err) {
		console.error("put-profile error:", err);
		return c.json({ message: "Internal Server Error" }, 500);
	}
};
