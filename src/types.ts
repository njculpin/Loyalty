export type Wallet = {
  address: string;
  points: number;
  coins: number;
};

export type NFT = {
  id: string;
  promotionId: string;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  points: number;
  coins: number;
  reward: string;
  price: number;
  owner: string;
  totalSupply: number;
  createdAt: number;
  forSale: boolean;
};

export type Promotion = {
  id: string;
  active: boolean;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  pointsRequired: number;
  coinsRequired: number;
  coins: number;
  points: number;
  reward: string;
  key: string;
  qRUrl: string;
  minted: boolean;
  price: number;
  totalSupply: number;
  forSale: boolean;
};

export type Card = {
  id: string;
  active: boolean;
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  patronWallet: string;
  pointsRequired: number;
  coinsRequired: number;
  promotionId: string;
  points: number;
  coins: number;
  createdAt: number;
  updatedAt: number;
};

export type Vendor = {
  businessCity: string;
  businessEmail: string;
  businessName: string;
  businessPhone: string;
  businessPostalCode: string;
  businessRegion: string;
  businessStreetAddress: string;
  businessCountry: string;
  businessWallet: string;
  qRUrl: string;
};
