// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";


contract LoyaltyCoin is ERC20, ERC721Holder, Ownable {

    address public earningsConsumer;
    mapping(string => uint256) public pointsByRecordId;

    constructor(uint256 _initialSupply) ERC20("LYLT Coin", "LYLT") {
        _mint(msg.sender, _initialSupply);
    }

    function mint(string memory _recordId, uint256 _amount) public payable returns (bool)  {
        require(pointsByRecordId[_recordId] >= 1, 'you do not have enough points');
        _mint(msg.sender, _amount);
        return true;
    }

    function verifyEarnings(string memory _recordId) public view returns (uint256){
        return pointsByRecordId[_recordId];
    }

    function setEarnings(string memory _recordId, uint256 _amount) external returns (bool){
        require(earningsConsumer == msg.sender, 'request not sent from oracle');
        pointsByRecordId[_recordId] = _amount;
        return true;
    }

    function setEarningsConsumer(address _address) public onlyOwner returns (bool){
        earningsConsumer = _address;
        return true;
    }
    
}