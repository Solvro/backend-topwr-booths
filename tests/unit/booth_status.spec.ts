import { test } from "@japa/runner";

test.group("Booth status API", () => {
  test("GET /api/v1/booths/status should return empty array initially", async ({
    client,
  }) => {
    const response = await client.get("/api/v1/booths/status");

    response.assertStatus(200);
    response.assertBodyContains([]);
  });

  test("GET /api/v1/healthcheck should return ok", async ({ client }) => {
    const response = await client.get("/api/v1/healthcheck");

    response.assertStatus(200);
    response.assertBodyContains({ status: "ok" });
  });
});
