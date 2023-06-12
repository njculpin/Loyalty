// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract EarningsConsumer is ChainlinkClient, ConfirmedOwner {
    using Chainlink for Chainlink.Request;


    mapping(uint256 => uint256) public lyltBalance;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    
    uint256 public earning;
    bytes32 private jobId;
    uint256 private fee;
    string public api;

    event RequestEarnings(bytes32 indexed requestId, uint256 value);

    constructor(address _link, address _oracle, string memory _api, string memory _job) ConfirmedOwner(msg.sender) {
        setChainlinkToken(_link);
        setChainlinkOracle(_oracle);
        jobId = stringToBytes32(_job);
        api = _api;
        fee = 1 * LINK_DIVISIBILITY / 10;
    }

    function stringToBytes32(string memory source) public pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        assembly {
            result := mload(add(source, 32))
        }
    }

    function requestEarningsData(uint256 _tokenId) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );
        req.add("get", string.concat(api, Strings.toString(_tokenId)));
        req.add("path", "value");
        req.addInt("times", 1);
        requestIdToTokenId[requestId] = _tokenId;
        return sendChainlinkRequest(req, fee);
    }

    function fulfill(
        bytes32 _requestId,
        uint256 _value
    ) public recordChainlinkFulfillment(_requestId) {
        lyltBalance[requestIdToTokenId[_requestId]] = _value;
        emit RequestEarnings(_requestId, _value);
    }

    function getEarningsFromStore() public view returns (uint256){
        return earning;
    }

    function setApiUrl(string memory _api) public onlyOwner {
        api = _api;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }
}
