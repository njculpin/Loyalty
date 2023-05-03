// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "solmate/tokens/ERC721.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";

contract LoyaltyCard is ERC721 {

    /*
    * This Loyalty Card can be loaded with Loyalty Points
    * Each card also contains history of where the points were aquired
    */

    uint256 public currentTokenId;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) {}

    function mintTo(address recipient) public payable returns (uint256) {
        uint256 newItemId = ++currentTokenId;
        _safeMint(recipient, newItemId);
        return newItemId;
    }

    function tokenURI(uint256 id) public view virtual override returns (string memory) {
        return Strings.toString(id);
    }

    // look up token id
    // increment token point value
    // send erc20 loyalty point TO that token FROM the Vendor Card
    // if current amount divisible by limit = 0 || current amount > limit, allow redeem
    function punchCard(uint _tokenId, uint256 _amount) public {}

    // look up token id
    // increment token point value
    // send erc20 loyalty point FROM that token TO the Vendor Card
    // if current amount divisible by limit = 0 || current amount > limit, allow redeem
    function redeemCard(uint _tokenId) public {}

    // look up token id
    // increment token point value
    function getLoyalty(unit _tokenId) public {}

}

// Tap Apple / Google Pay 
// --> post https://Loyalty.com/{vendor}/{address} 
// --> contract function get loyalty 
// --> punch card or 
// --> redeem card
// -----> 
