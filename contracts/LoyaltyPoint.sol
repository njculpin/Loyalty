// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract LoyaltyPoint is ERC20, ERC721Holder, Ownable {

    constructor(string memory _name, string memory  _ticker) ERC20(_name, _ticker) {}

    function mint(address _recipient , uint256 _amount) public payable returns (bool)  {
        _mint(_recipient, _amount);
        return true;
    }
    
}