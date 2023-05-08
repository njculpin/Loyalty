// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { LoyaltyCard } from './LoyaltyCard.sol';
import { LoyaltyPoint } from './LoyaltyPoint.sol';

contract LoyaltyManager {

    LoyaltyCard public patronCard;
    LoyaltyCard public vendorCard;
    LoyaltyPoint public loyaltyPoint;

    mapping(uint256 => mapping(uint256 => uint256)) private _patronVendorBalances;
    mapping(uint256 => uint256) private _patronBalances;
    mapping(uint256 => uint256) private _vendorBalances;

    event CreateLoyalty(address indexed patron, address indexed vendor, uint256 value);
    event RedeemLoyalty(uint256 indexed patron, uint256 indexed vendor, uint256 value);
    event MintVendor(address indexed vendor, uint256 value);
    event MintLoyalty(uint256 indexed vendor, uint256 value);


    constructor(address _vendorCard, address _patronCard, address _loyaltyPoint){
        patronCard = LoyaltyCard(_patronCard);
        vendorCard = LoyaltyCard(_vendorCard);
        loyaltyPoint = LoyaltyPoint(_loyaltyPoint);
    }

    function mintPatronCard(string memory _tokenURI) external payable returns (uint256) {
        return patronCard.mint(msg.sender, _tokenURI);
    }

    function mintVendorCard(string memory _tokenURI) external payable returns (uint256) {
        uint256 _tokenId = vendorCard.mint(msg.sender, _tokenURI);
        emit MintVendor(msg.sender, _tokenId);
        return _tokenId;
    }

    function createLoyalty(uint256 _patronCardId, uint256 _vendorCardId, uint256 _amount) public payable returns (uint256) {
        address vendorAddress = vendorCard.getAddress(_vendorCardId);
        require(msg.sender == vendorAddress, 'the vendor must authorize this request');
        
        emit CreateLoyalty(msg.sender, vendorAddress, _amount);
        _patronVendorBalances[_patronCardId][_vendorCardId] += _amount;
        _patronBalances[_patronCardId] += _amount;
        return _amount;
    }

    function getPatronLoyaltyBalanceFromVendor(uint256 _patronCardId, uint256 _vendorCardId) public view returns (uint256){
        return _patronVendorBalances[_patronCardId][_vendorCardId];
    }

    function getPatronBalance(uint256 _patronCardId) public view returns (uint256){
        return _patronBalances[_patronCardId];
    }

    function getVendorBalance(uint256 _patronCardId) public view returns (uint256){
        return _vendorBalances[_patronCardId];
    }

    function getAddressOfPatronCardOwner(uint256 _patronCardId) public view returns (address){
        return patronCard.ownerOf(_patronCardId);
    }

    function redeemLoyalty(uint256 _patronCardId, uint256 _vendorCardId, uint256 _amount) public returns (uint256) {
        address vendorAddress = vendorCard.getAddress(_vendorCardId);
        require(msg.sender == vendorAddress, 'the vendor must authorize this request');
        require(_patronVendorBalances[_patronCardId][_vendorCardId] >= _amount, 'not enough loyalty on this card');
        emit RedeemLoyalty(_patronCardId, _vendorCardId, _amount);
        _patronVendorBalances[_patronCardId][_vendorCardId] -= _amount;
        _patronBalances[_patronCardId] -= _amount;
        _vendorBalances[_vendorCardId] += _amount;
        return _amount;
    }

    function cashOut(uint256 _vendorCardId, uint256 _amount) public returns (bool){
        require(_vendorBalances[_vendorCardId] > _amount, 'not enough loyalty to withdraw');
        emit MintLoyalty(_vendorCardId, _amount);
        _vendorBalances[_vendorCardId] -= _amount;
        loyaltyPoint.mint(msg.sender, _amount);
        return true;
    }

}