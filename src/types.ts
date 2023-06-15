export type Wallet = {
  address: string;
  points: number;
  coins: number;
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
};

export type PatronToPromotion = {
  id: string;
  key: string;
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
