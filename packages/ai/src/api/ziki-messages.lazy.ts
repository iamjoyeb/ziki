import type { ProviderStreams } from "../types.ts";
import { lazyApi } from "./lazy.ts";

export const zikiMessagesApi = (): ProviderStreams => lazyApi(() => import("./ziki-messages.ts"));
