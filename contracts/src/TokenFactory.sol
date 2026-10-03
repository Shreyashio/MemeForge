// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./MemeToken.sol";

contract TokenFactory {
    event TokenCreated(
        address indexed token,
        address indexed creator,
        string name,
        string symbol,
        string whitepaperCid
    );

    function createToken(
        string memory name,
        string memory symbol,
        uint256 supply,
        string memory whitepaperCid
    ) external returns (address) {
        MemeToken token = new MemeToken(name, symbol, supply, whitepaperCid, msg.sender);
        emit TokenCreated(address(token), msg.sender, name, symbol, whitepaperCid);
        return address(token);
    }
}
