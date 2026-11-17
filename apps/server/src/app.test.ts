import { afterAll, beforeAll, expect, test } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { HealthResponse } from "@helpdesk/shared";
import { createApp } from "./app.ts";

let server: Server;
let baseUrl: string;

beforeAll(() => {
  server = createApp().listen(0);
  const { port } = server.address() as AddressInfo;
  baseUrl = `http://localhost:${port}`;
});

afterAll(() => {
  server.close();
});

test("GET /api/health returns ok", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  expect(res.status).toBe(200);
  const body = (await res.json()) as HealthResponse;
  expect(body.status).toBe("ok");
});

test("unknown /api route returns 404 JSON", async () => {
  const res = await fetch(`${baseUrl}/api/nope`);
  expect(res.status).toBe(404);
  expect(await res.json()).toEqual({ error: "Not found" });
});
