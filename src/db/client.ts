import { createClient, ClickHouseClient } from "@clickhouse/client";

let client: ClickHouseClient | null = null;

export function getClickHouseClient(): ClickHouseClient {
  if (!client) {
    const host = process.env.CLICKHOUSE_HOST || "localhost";
    const port = Number.parseInt(process.env.CLICKHOUSE_PORT || "8123", 10);
    const username = process.env.CLICKHOUSE_USER || "default";
    const password = process.env.CLICKHOUSE_PASSWORD || "";
    const database = process.env.CLICKHOUSE_DATABASE || "default";

    client = createClient({
      url: `http://${host}:${port}`,
      username,
      password,
      database,
      clickhouse_settings: {
        async_insert: 1,
        wait_for_async_insert: 0,
      },
    });
  }

  return client;
}

export async function closeClickHouseClient(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
  }
}

export async function executeQuery<T = unknown>(
  query: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  const chClient = getClickHouseClient();
  const result = await chClient.query({
    query,
    query_params: params || {},
    format: "JSONEachRow",
  });

  const data = await result.json<T>();
  return Array.isArray(data) ? data : [];
}
