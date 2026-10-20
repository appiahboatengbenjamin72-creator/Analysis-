# Trade Analyzer

A mobile-friendly web app for educational market analysis and demo journaling.

## Features
- Responsive candlestick chart for loaded crypto market candles.
- Forex pair selector for EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, USD/CHF and NZD/USD, with a link to open the selected pair on TradingView.
- Public Binance spot candle feed for BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT and XRP/USDT.
- Candle-based CALL / PUT / WAIT rule estimate with a confirmation score.
- Five-minute expiry observation timer.
- Demo entry journal with price-direction outcomes and calculated win rate.
- Estimated taker-buy versus remaining candle volume, labelled as volume estimates rather than buyer/seller counts.
- Sample candles when the public market feed is unavailable.
- Progressive Web App manifest and a basic offline app shell.

## Open on Android
After GitHub Pages deployment completes, open:
https://appiahboatengbenjamin72-creator.github.io/Analysis-/

In Chrome, use the menu and choose **Add to Home screen** or **Install app** if offered.

## Publish with GitHub Pages
The repository includes a GitHub Actions workflow at `.github/workflows/pages.yml` that deploys the site on pushes to `main`. In **Settings → Pages**, ensure **Build and deployment** is set to **GitHub Actions**. Wait for the workflow to complete before using the app link.

## Limitations
- Crypto candles use the public Binance spot API, not Pocket Option data. Forex charts open on TradingView; this app does not yet calculate forex signals from a connected forex candle feed. API access can be blocked or unavailable on some networks.
- The app does not place trades, connect to a broker, or guarantee accurate signals.
- Demo results compare entry and expiry price direction only; they do not model payouts, spreads, slippage, or fees.
- Buyer/seller figures are candle-volume estimates, not counts of unique people or all trades.
- This web app is not an APK. Native Android packaging requires a separate build step.
