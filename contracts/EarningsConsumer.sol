// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import './LoyaltyCoin.sol';
import './LoyaltyNFT.sol';

contract EarningsConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;

    mapping(string => uint256) public pointsByRecordId;
    mapping(bytes32 => string) public requestIdToRecordId;
    
    address public lyltNftAddress;
    address public lyltCoinAddress;
    uint256 public earning;
    bytes32 private jobId;
    uint256 private fee;
    string public api;

    event RequestEarnings(bytes32 indexed requestId, uint256 value);

    constructor(
        address _link, 
        address _oracle, 
        string memory _job, 
        string memory _api
        ) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = stringToBytes32(_job);
        api = _api;
        fee = 1 * LINK_DIVISIBILITY / 10;
    }

    function stringToBytes32(
        string memory source
        ) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function requestRecordEarningsData(
        string memory _recordId
        ) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfillToken.selector
        );
        req.add("get", string.concat(api, _recordId));
        req.add("path", "value");
        req.addInt("times", 1);
        requestIdToRecordId[requestId] = _recordId;
        return sendChainlinkRequest(req, fee);
    }

    function fulfillToken(
        bytes32 _requestId,
        uint256 _value
    ) public recordChainlinkFulfillment(_requestId) {
        pointsByRecordId[requestIdToRecordId[_requestId]] = _value;
        string memory record = requestIdToRecordId[_requestId];
        LoyaltyCoin(lyltCoinAddress).setEarnings(record, _value);
        LoyaltyNFT(lyltNftAddress).setEarnings(record, _value);
        emit RequestEarnings(_requestId, _value);
    }

    function verifyEarnings(
        string memory _recordId)
         public view returns (uint256){
        return pointsByRecordId[_recordId];
    }

    function setTokenApiUrl(
        string memory _api
        ) public onlyOwner {
        api = _api;
    }

    function setLoyaltyCoinAddress(address _address) public onlyOwner returns(bool) {
        lyltCoinAddress = _address;
        return true;
    }

    function setLoyaltyNftAddress(address _address) public onlyOwner returns(bool) {
        lyltNftAddress = _address;
        return true;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
