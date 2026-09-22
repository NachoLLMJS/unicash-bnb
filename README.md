# Unicash frontend prototype

Original static frontend for a BNB Chain marketplace for fully onchain SVG NFTs, where listings and purchases settle in the verified ZEC BEP-20 token.

## Protocol direction

- NFT ownership: BEP-721/ERC-721; BEP-1155/ERC-1155 for editions.
- Art: contract-generated SVG returned through Base64 `tokenURI` data URIs.
- Settlement: marketplace transfers the verified ZEC BEP-20 token.
- Programmable liquidity: intended Uniswap v4 hook architecture for ZEC pool-aware fees and settlement rules.
- Hybrid path: ERC-404/DN404 only if fungible/NFT duality becomes an explicit requirement.

The Uniswap v4 hook contracts, marketplace contract and NFT collection contracts are not deployed or configured in this frontend yet. Their controls remain unavailable until verified addresses and bytecode exist.

## Verified token

- Chain: BNB Smart Chain (chain ID 56)
- Contract: `0x1Ba42e5193dfA8B03D15dd1B86a3113bbBEF8Eeb`
- RPC reads: deployed bytecode, `name = Zcash Token`, `symbol = ZEC`, `decimals = 18`
- Public ZEC/WBNB PancakeSwap V3 pool: `0xbd0dbC5830d49ee8B3F068BFf495E891E015FD7C`

## Artwork

The gallery displays the locally stored collection images only. Cards are not links and expose no source-site navigation.

The main hero uses the exact user-supplied yellow pixel-unicorn image stored at `assets/hero/unicash-mainpage-reference.png`.

## Product boundary

The frontend is interactive and the external swap route is live. The NFT collection, marketplace, Uniswap v4 hook, indexer and privacy contracts are not yet supplied. The UI does not fabricate mints, listings, floor prices, volume or transaction receipts.

Fully onchain SVG metadata provides permanence and verifiability. It does not provide transaction privacy on BNB Chain. A separate audited shielded settlement layer would be required before making a total-privacy claim.

## Run locally

```bash
python -m http.server 43177
```

Open `http://127.0.0.1:43177/`.
