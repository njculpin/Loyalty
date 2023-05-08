// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract LoyaltyCard is ERC721URIStorage, Ownable {

    address public loyaltyManager;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    constructor(string memory _name, string memory  _ticker) ERC721(_name, _ticker) {}

    function mint(address to, string memory tokenURI) external returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        _tokenIdCounter.increment();
        return tokenId;
    }

    function setLoyaltyManagerAddress(address _loyaltyManager) public onlyOwner returns (bool) {
        loyaltyManager = _loyaltyManager;
        return true;
    }

}