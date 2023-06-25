export type Wallet = {
  address: string;
  points: number;
  coins: number;
};

export type Promotion = {
  id: string;
  active: boolean;
  businessCity: "";
  businessEmail: "";
  businessName: "";
  businessPhone: "";
  businessPostalCode: "";
  businessRegion: "";
  businessStreetAddress: "";
  businessCountry: "";
  businessWallet: "";
  pointsRequired: number;
  coinsRequired: number;
  coins: number;
  points: number;
  reward: string;
  key: string;
  qRUrl: string;
  minted: boolean;
  price: number;
  supply: number;
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
  reward: string;
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
};
