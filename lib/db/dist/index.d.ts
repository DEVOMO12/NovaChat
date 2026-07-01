import * as schema from "./schema";
export * from "./schema";
export { eq, and, or, desc, asc, ilike, sql, not, isNull, isNotNull, inArray, like, ne, gt, gte, lt, lte, count } from "drizzle-orm";
export declare const pool: import("pg").Pool;
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
    $client: import("pg").Pool;
};
//# sourceMappingURL=index.d.ts.map