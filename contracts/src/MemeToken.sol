// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeToken is ERC20, Ownable {
    string public whitepaperCid;

    constructor(
        string memory name,
        string memory symbol,
        uint256 supply,
        string memory _whitepaperCid,
        address creator
    ) ERC20(name, symbol) Ownable(creator) {
        whitepaperCid = _whitepaperCid;
        _mint(creator, supply);
    }
}
