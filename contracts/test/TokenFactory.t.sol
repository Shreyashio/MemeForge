// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/TokenFactory.sol";
import "../src/MemeToken.sol";

contract TokenFactoryTest is Test {
    TokenFactory public factory;
    address alice = makeAddr("alice");

    function setUp() public {
        factory = new TokenFactory();
    }

    function testCreateToken() public {
        vm.startPrank(alice);
        address tokenAddr = factory.createToken(
            "TestCoin",
            "TEST",
            1_000_000 ether,
            "QmTest123"
        );
        vm.stopPrank();

        // Token deployed
        assertTrue(tokenAddr != address(0), "token address should be non-zero");

        MemeToken token = MemeToken(tokenAddr);
        assertEq(token.name(), "TestCoin", "name mismatch");
        assertEq(token.symbol(), "TEST", "symbol mismatch");
        assertEq(token.totalSupply(), 1_000_000 ether, "supply mismatch");
        assertEq(token.balanceOf(alice), 1_000_000 ether, "creator should hold supply");
        assertEq(token.whitepaperCid(), "QmTest123", "cid mismatch");
        assertEq(token.owner(), alice, "owner should be creator");
    }

    function testCreateTokenEmitsEvent() public {
        vm.startPrank(alice);
        // We can only check indexed args and partial non-indexed with checkTopic1=true
        vm.expectEmit(false, true, false, false); // check creator (topic2)
        emit TokenFactory.TokenCreated(address(0), alice, "", "", "");
        factory.createToken("EventCoin", "EVT", 500 ether, "QmEvent");
        vm.stopPrank();
    }

    function testMultipleDeployments() public {
        address token1 = factory.createToken("CoinA", "CNA", 100 ether, "CidA");
        address token2 = factory.createToken("CoinB", "CNB", 200 ether, "CidB");
        assertTrue(token1 != token2, "each deployment should be unique");
        assertEq(MemeToken(token1).name(), "CoinA");
        assertEq(MemeToken(token2).name(), "CoinB");
    }

    function testSupplyMintedToCreator() public {
        uint256 supply = 1_000_000_000 ether; // 1B tokens, 18 decimals
        address tokenAddr = factory.createToken("BigCoin", "BIG", supply, "");
        MemeToken token = MemeToken(tokenAddr);
        assertEq(token.totalSupply(), supply);
        assertEq(token.balanceOf(address(this)), supply);
    }
}
