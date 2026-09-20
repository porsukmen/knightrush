# Town and resident store visual rollback

renderer.js preserves the block from townProject through drawTownShopInterior,
before the Keskin Düzlem revamp. Restore only the needed drawing functions after
reviewing later changes, never the entire HTML. Store display props also switched
to drawMerchantProp's detailed=true art (browse and handoff) in drawMerchantShop.
Stock, click regions, prices, transactions and town navigation are not redesigned.

The PNGs show the previous town/store. The approved travelling merchant is also
saved as the current style reference; do not change it when restoring this town.
