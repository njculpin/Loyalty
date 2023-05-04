// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

import { LoyaltyCard } from './LoyaltyCard.sol';
import { LoyaltyPoint } from './LoyaltyPoint.sol';

contract LoyaltyManager is Ownable {

    LoyaltyCard public loyaltyCard;
    LoyaltyPoint public loyaltyPoint;

    constructor(address _loyaltyCard, address _loyaltyPoint){
        loyaltyCard = LoyaltyCard(_loyaltyCard);
        loyaltyPoint = LoyaltyPoint(_loyaltyPoint);
    }

    function distribute(address _vendor, address _patron) external {
        // message sender should be the vendor AND patron address
        // manager will confirm ownership of LoyaltyCard in both wallets
        // manager will send a token to the Patron address
        loyaltyPoint.distribute(_vendor, _patron);
    }

    function redeem(address _vendor, address _patron) external {
        // message sender should be the vendor AND patron address
        // manager will confirm ownership of LoyaltyCard in both wallets
        // manager will send tokens to the Vendor address
        loyaltyPoint.redeem(_vendor, _patron);
    }

    function getCardBalance(address _card) external view returns (uint256) {
        // get the balance of a particular card
        return loyaltyPoint.getCardBalance(_card);
    }

    function setLoyaltyPointCost(uint256 _newPrice) public onlyOwner {
        loyaltyPoint.setLoyaltyPointCost(_newPrice);
    }

    function withdraw() public payable onlyOwner {
        (bool owner, ) = payable(owner()).call{value: address(this).balance}("");
        require(owner, "withdraw failed");
    }

}