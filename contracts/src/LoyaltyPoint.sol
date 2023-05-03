// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "solmate/tokens/ERC20.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";

contract LoyaltyPoint is ERC20 {
    
    constructor(string memory _name, string memory _symbol) ERC20(_name, _symbol) 
    {
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}
