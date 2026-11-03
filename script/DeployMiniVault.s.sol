// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {MiniVault} from "../contracts/MiniVault.sol";

contract DeployMiniVault is Script {
    function run() external returns (MiniVault vault) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);
        vault = new MiniVault();
        vm.stopBroadcast();
    }
}
