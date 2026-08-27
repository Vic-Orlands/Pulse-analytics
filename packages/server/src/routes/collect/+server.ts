import type { RequestHandler } from "./$types";
import { handleCollect } from "~/analytics/worker-collect";

export const GET: RequestHandler = async ({ request, platform }) => {
    return handleCollect(request, platform?.env ?? {});
};

export const POST: RequestHandler = GET;

export const OPTIONS: RequestHandler = async ({ request, platform }) => {
    return handleCollect(request, platform?.env ?? {});
};
