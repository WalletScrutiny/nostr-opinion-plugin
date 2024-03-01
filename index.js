import { expertOpinions } from '/src/main.ts';
expertOpinions.trustedAuthors = [
	// John and Jane will be considered trusted users
	'npub1f70prcng8zwcdjfh5pr7g4txasn40a4pdwyj5vz7x6kwfx4kcrxqn62uvh', // John Nostrich
	'npub14weyavuc729m2g5jy06ttlvrpn390f25hvsh2nszrvtvd2nuttqs7sjch3' // Jane Nostrich
];
expertOpinions.trustedBadges = [
	// A badge awarded by John, awarded to Jane
	// 'naddr1qqx4w5ed23jhxapdgfskgem9qyxhwumn8ghj7mn0wvhxcmmvqgsyl8s3uf5r38vxeym6q3ly24nwcf6h76skhzf2xp0rdt8yn2mvpnqrqsqqqafemy2qnm'
];
expertOpinions.trustedBadgeAuthors = [
	// John's npub, all badges by John and the awardees who have accepted those badges will be considered trusted users
	// 'npub1f70prcng8zwcdjfh5pr7g4txasn40a4pdwyj5vz7x6kwfx4kcrxqn62uvh'
];
expertOpinions.headline = 'Community Opinions ($$nTrusted$$/$$nAll$$)';
expertOpinions.description =
	'These comments are contributed by nostr users using the nostr-opinions-plugin.';
