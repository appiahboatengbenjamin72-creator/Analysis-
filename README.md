# Trade Analyzer

A mobile-friendly web app for educational market analysis and demo journaling.

## Features
- Public Binance spot candle feed for BTC/USDT, ETH/USDT, BNB/USDT, SOL/USDT and XRP/USDT.
- Candle-based CALL / PUT / WAIT rule estimate with a confirmation score.
- Five-minute expiry observation timer.
- Demo entry journal with price-direction outcomes and calculated win rate.
- Estimated taker-buy versus remaining candle volume, labelled as volume estimates rather than buyer/seller counts.
- Sample candles when the public market feed is unavailable.
- Progressive Web App manifest and a basic offline app shell.

## Publish with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, select **GitHub Actions** if the workflow is available, or select **Deploy from a branch** and choose `main` / `/(root)`.
3. Wait for the deployment to finish.
4. Open the published site in Android Chrome. Use **Add to Home screen** or **Install app** if offered.

## Limitations
- The feed uses the public Binance spot API, not Pocket Option data. API access can be blocked or unavailable on some networks.
- The app does not place trades, connect to a broker, or guarantee accurate signals.
- Demo results compare entry and expiry price direction only; they do not model payouts, spreads, slippage, or fees.
- Buyer/seller figures are candle-volume estimates, not counts of unique people or all trades.
- This web app is not an APK. Native Android packaging requires a separate build step.