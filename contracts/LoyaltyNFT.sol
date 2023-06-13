// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoyaltyNFT is ERC721, ERC721URIStorage, Ownable {

    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    address public earningsConsumer;
    mapping(string => uint256) public pointsByRecordId;

    constructor() ERC721("LYLT NFT", "LYLTN") {}

    function safeMint(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function verifyEarnings(string memory _recordId) public view returns (uint256){
        return pointsByRecordId[_recordId];
    }

    function setEarnings(string memory _recordId, uint256 _amount) external returns (bool){
        require(earningsConsumer == msg.sender, 'request not sent from oracle');
        pointsByRecordId[_recordId] = _amount;
        return true;
    }
    
}