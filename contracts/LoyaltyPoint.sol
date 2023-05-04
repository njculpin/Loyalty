// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract LoyaltyPoint is ERC20, ERC721Holder, Ownable {

    uint256 public price = 0.001 ether; 
    mapping(address => uint256) public balances;
    mapping(address => bool) cardHolders; // call loyalty card directly

    constructor() ERC20("Loyalty Point", "LYLT") {}

    function mint(uint256 _amount) external payable {
        require(cardHolders[msg.sender], 'you must own a card');
        require(msg.value >= price, "Not enough Matic sent; check price!");
        _mint(msg.sender, _amount);
        // send remainder to loyalty manager
    }

    function setLoyaltyPointCost(uint256 _price) external {
        price = _price;
    }

    function redeem(address _vendor, address _patron) external {
        balances[_vendor] = balances[_vendor] - 1;
        balances[_patron] = balances[_patron] + 1;
    }

    function getCardBalance(address _card) external view returns (uint256) {
        return balances[_card];
    }

    function distribute(address _vendor, address _patron) external {
        balances[_patron] = balances[_patron] + 1;
        balances[_vendor] = balances[_vendor] - 1;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

}