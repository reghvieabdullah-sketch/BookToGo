import type { SupabaseClient } from "@supabase/supabase-js";

export type DBResult<T> = { data: T | null; error: string | null };

export async function runRPC<T>( supabase: SupabaseClient, fn: string, params: Record<string, any>, errorPrefix = ""){
    const { data, error } = await supabase.rpc(fn, params);
    if (error) return { data: null, error: `${errorPrefix ?? 'Error'}-${error.message}`}
    return { data, error: null };
}

export function ensureArgs(args: Record<string, any>): string | null {
    for (const [key, value] of Object.entries(args)) if (!value) return `Missing ${key}`
    return null;
}
