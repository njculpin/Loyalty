// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { LoyaltyCard } from './LoyaltyCard.sol';
import { LoyaltyPoint } from './LoyaltyPoint.sol';

contract LoyaltyManager {

    LoyaltyCard public loyaltyCard;
    LoyaltyPoint public loyaltyPoint;

    address public loyaltyPointAddress;

    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Created(address indexed owner, uint256 amount);

    constructor(address _loyaltyCard, address _loyaltyPoint){
        loyaltyCard = LoyaltyCard(_loyaltyCard);
        loyaltyPoint = LoyaltyPoint(_loyaltyPoint);
    }

    // Check amount available to transfer
    function balance(address owner) public view returns (uint256) {
        // loyaltyPoint.balanceOf(owner);
        return _balances[owner];
    }

    // Check amount available to transfer
    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    // increase balance on vendor
    function deposit(uint256 amount) internal {
        _balances[msg.sender] += amount;
        require(loyaltyPoint.transfer(msg.sender, amount), 'Deposit Failed');
        emit Created(msg.sender, amount);
    }

     // Give a reciever permission to take tokens
    function approve(address spender, uint256 amount) public returns (bool) {
        require(spender != address(0), "ERC20: approve to the zero address");
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    // Request a claim from current token holder to reciever
    function transferFrom(address sender, address recipient, uint256 amount) public returns (bool) {
        require(_allowances[sender][msg.sender] >= amount, "ERC20: Allowance not high enough.");
        _allowances[sender][msg.sender] -= amount;
        _transfer(sender, recipient, amount);
        return true;
    }

    // Execute the claim
    function _transfer(address sender, address recipient, uint256 amount) internal {
        require(sender != address(0), "ERC20: transfer from the zero address");
        require(recipient != address(0), "ERC20: transfer to the zero address");
        require(_balances[sender] >= amount, "ERC20: Not enough funds.");
        // transfer actual tokens
        require(loyaltyPoint.transfer(recipient, amount), 'Transfer Failed');
        // transfer contract balance
        _balances[sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(sender, recipient, amount);
    }

}