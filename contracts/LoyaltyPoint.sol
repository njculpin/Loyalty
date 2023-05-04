// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract LoyaltyPoint is ERC20, ERC721Holder, Ownable {

    address public loyaltyManager;

    constructor(string memory _name, string memory  _ticker) ERC20(_name, _ticker) {}

    function mint(address recipient , uint256 _amount) external payable {
        require(msg.sender == loyaltyManager, 'You must request from the Loyalty Manager');
        _mint(recipient, _amount);
    }

}