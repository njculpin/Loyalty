// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract LoyaltyCoin is ERC20, ERC721Holder, Ownable {

    constructor(uint256 _initialSupply) ERC20("LoyaltyCoin", "LYLT") {
        _mint(msg.sender, _initialSupply);
    }

    function mint(address _recipient, uint256 _amount) public payable returns (bool)  {
        _mint(_recipient, _amount);
        return true;
    }
    
}