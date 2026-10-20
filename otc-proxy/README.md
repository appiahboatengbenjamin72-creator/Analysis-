# Pocket Option OTC proxy for Trade Analyzer

This Worker keeps your OTCharts API key server-side. Do **not** paste the key into the public website, this repository, or the Trade Analyzer endpoint field.

## Before you start

1. Create an account at [OTCharts](https://otcharts.com/pocket-option-api), confirm your email, and create an API key.
2. Create a Cloudflare account and open **Workers & Pages**.
3. Create a Worker named `trade-analyzer-otc-proxy`.
4. Paste the contents of `worker.js` into the Worker editor and deploy it.
5. In the Worker settings, open **Settings → Variables and Secrets** and add a secret named `OTCHARTS_API_KEY`. Paste the OTCharts key into that secret field, save, and redeploy if Cloudflare asks.
6. Copy the Worker HTTPS URL (for example, `https://trade-analyzer-otc-proxy.<your-subdomain>.workers.dev`). Do not share the key.

## Connect the Trade Analyzer

1. Open [Trade Analyzer](https://appiahboatengbenjamin72-creator.github.io/Analysis/).
2. Under **Market data source**, choose **Pocket Option OTC (secure proxy)**.
3. Select one of the listed OTC pairs.
4. In **OTC secure proxy HTTPS endpoint**, paste the Worker URL and tap **Save OTC proxy and test**.

The app sends `symbol`, `timeframe`, and `limit` query parameters to the Worker. The Worker fetches candles from OTCharts and returns JSON in the format the analyzer expects.

## Security and limitations

- The Worker only allows requests from this Trade Analyzer GitHub Pages origin and only the five listed symbols/timeframes.
- The OTCharts key is stored as a Worker secret; it is not embedded in the public app.
- OTCharts is an independent third-party feed, not an official Pocket Option API. Candle/quote differences are possible.
- The free plan's quota and symbol access may change. Check the [OTCharts API documentation](https://otcharts.com/api).
- This proxy reads data only. It does not log in to Pocket Option, place trades, or guarantee signals.
