// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenFactory.sol";

contract DeployFactory is Script {
    function run() external returns (address factoryAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        TokenFactory factory = new TokenFactory();
        factoryAddress = address(factory);

        vm.stopBroadcast();

        console.log("TokenFactory deployed at:", factoryAddress);
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_TOKEN_FACTORY_ADDRESS=", factoryAddress);
    }
}
