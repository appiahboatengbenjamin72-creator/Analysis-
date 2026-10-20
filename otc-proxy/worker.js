/**
 * Trade Analyzer OTC proxy for Cloudflare Workers.
 * Keep OTCHARTS_API_KEY in Worker secrets; never put it in this file or GitHub.
 */
const ALLOWED_ORIGIN = "https://appiahboatengbenjamin72-creator.github.io";
const SYMBOLS = new Set(["EURUSD_otc", "GBPUSD_otc", "USDJPY_otc", "BTCUSD_otc", "AUDUSD_otc"]);
const TIMEFRAMES = new Map([
  ["1m", 60], ["5m", 300], ["15m", 900], ["30m", 1800],
  ["1h", 3600], ["4h", 14400], ["1d", 86400]
]);

function reply(body, status = 200, origin = ALLOWED_ORIGIN) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Access-Control-Allow-Origin": origin,
      "Vary": "Origin",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== ALLOWED_ORIGIN) return reply({ error: "Origin not allowed" }, 403);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin"
      }});
    }
    if (request.method !== "GET") return reply({ error: "GET only" }, 405);
    if (!env.OTCHARTS_API_KEY) return reply({ error: "Server secret OTCHARTS_API_KEY is not configured" }, 503);

    const url = new URL(request.url);
    const symbol = url.searchParams.get("symbol") || "EURUSD_otc";
    const timeframe = url.searchParams.get("timeframe") || "5m";
    const limit = Math.max(5, Math.min(100, Number.parseInt(url.searchParams.get("limit") || "100", 10) || 100));
    if (!SYMBOLS.has(symbol)) return reply({ error: "Unsupported OTC symbol" }, 400);
    if (!TIMEFRAMES.has(timeframe)) return reply({ error: "Unsupported timeframe" }, 400);

    const upstream = new URL("https://otcharts.com/v1/candles");
    upstream.searchParams.set("venue", "otc");
    upstream.searchParams.set("symbol", symbol);
    upstream.searchParams.set("tf", String(TIMEFRAMES.get(timeframe)));
    upstream.searchParams.set("limit", String(limit));

    try {
      const response = await fetch(upstream.toString(), {
        headers: { "Authorization": "Bearer " + env.OTCHARTS_API_KEY, "Accept": "application/json" },
        signal: AbortSignal.timeout(12000)
      });
      const data = await response.json();
      if (!response.ok) return reply({ error: data?.error || "OTCharts request failed", upstreamStatus: response.status }, response.status >= 500 ? 502 : response.status);
      if (!Array.isArray(data.candles)) return reply({ error: "OTCharts response did not contain candles" }, 502);
      return reply({ symbol, timeframe, candles: data.candles, price: data.candles.length ? Number(data.candles[data.candles.length - 1].close) : null });
    } catch (error) {
      return reply({ error: "Unable to reach the OTC market-data service" }, 502);
    }
  }
};
