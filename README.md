# Trade Analyzer

A mobile-friendly web app for live public Forex and crypto market analysis, five-minute observation tracking, and manual trade journaling.

## Features
- Responsive candlestick chart for loaded crypto market candles.
- Live Forex OHLC candles and quote checks for EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, USD/CHF and NZD/USD via the public Biquote market-data feed; TradingView chart link for cross-checking.
- Public Binance spot candle feed for BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT and XRP/USDT.
- Candle-based CALL / PUT / WAIT rule estimate with a confirmation score for supported live Forex and crypto candles.
- Five-minute expiry observation timer.
- Manual-entry journal with price-direction outcome tracking and calculated win rate; it does not execute or verify broker orders.
- Estimated taker-buy versus remaining candle volume, labelled as volume estimates rather than buyer/seller counts.
- Clearly labelled sample candles for interface testing only when the market feed is unavailable.
- Progressive Web App manifest and a basic offline app shell.

## Open on Android
After GitHub Pages deployment completes, open:
https://appiahboatengbenjamin72-creator.github.io/Analysis-/

In Chrome, use the menu and choose **Add to Home screen** or **Install app** if offered.

## Publish with GitHub Pages
The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the site on pushes to `main`. In **Settings → Pages**, ensure **Build and deployment** is set to **GitHub Actions**. Wait for the workflow to complete before using the app link.

## Limitations
- Crypto candles use the public Binance spot API; Forex candles and quotes use the public Biquote API. These feeds can be unavailable or delayed, and their prices may differ from Pocket Option's quotes.
- Pocket Option: this app does not log into Pocket Option or place orders. The public information reviewed did not establish an official, documented Pocket Option trading API; do not give account passwords or session tokens to unofficial connectors.
- Signals are rule-based market analysis, not financial advice or guaranteed predictions. Check the selected broker's own chart and quote before entering manually.
- The five-minute timer tracks an observation window only. The journal records user-entered price direction and does not verify real broker fills, payouts, spreads, slippage, or fees.
- Crypto buyer/seller figures are estimates from Binance candle volume, not counts of unique traders. Forex buyer/seller counts are not available in this feed.
- This web app is not an APK. Native Android packaging requires a separate build step.
