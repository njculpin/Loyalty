## LYLT - work in progress

LYLT is a two-way incentive system specifically designed for small business and their customers. LYLT is similar to the paper punch cards that allow a customer to exercise 'buy 5 get 1 free deal in their local
sandwich shop but it allows a store owner to capture recurring customers through their mobile devices and proof of ownership of digital assets.

A Vendor will sign up on the LYLT website and be issued a Vendor Card ERC721 token. This card contains information about the vendor and the kind of deal they would like to offer. For example, a sandwich
shop owner may want to offer a buy 5 sandwiches get the 6th free deal. After registration, the vendors may begin to issue LYLT tokens to the patron in the form of an ERC20 token. These tokens
are in a locked state until they are returned to the Vendor.

Patrons will sign up and be issued a Loyalty Card ERC721 token and may interact with the vendor through their choice of QR Code, NFC chip, or selecting their location from the search form. Using the same sandwich example above, upon on the 5th visit,
the patron can redeem their LYLT tokens. The patron then sends their tokens back to the vendor in exchange for their sandwich, only this time the Vendor now has usable ERC20 tokens.

At this point, the vendor has some choices, they can either stake their LYLT tokens or cash out. Staking allows the tokens to remain in the contract in order to support the transaction fees
of the network in exchange for other rewards. Cashing out will mint the actual ERC20 tokens into the blockchain and deposit them back into the Vendor's Wallet, where they may be transferred to
any Wallet they wish. In the future, tokens may be used by all participating vendors to purchase goods and services.

### TECHNOLOGIES

- Typescript
- NextJS
- TailwindCSS
- Zustand
- Polygon Network
- Alchemy
- Hard Hat
- Biconomy

### HARDHAT

```
npx hardhat compile
```

```
npx hardhat test
```

```
npx hardhat node
```

```
npx hardhat run --network localhost scripts/deploy.ts
```

```
npx hardhat run --network mumbai scripts/deploy.ts
```
