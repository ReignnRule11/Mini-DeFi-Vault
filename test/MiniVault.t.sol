// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MiniVault} from "../contracts/MiniVault.sol";

contract MiniVaultTest is Test {
    MiniVault vault;
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    function setUp() public {
        vault = new MiniVault();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
    }

    function testDeposit() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        assertEq(vault.balances(alice), 2 ether);
        assertEq(vault.totalDeposits(), 2 ether);
    }

    function testWithdrawOwnDeposit() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        uint256 beforeBalance = alice.balance;
        vm.prank(alice);
        vault.withdraw(1 ether);

        assertEq(vault.balances(alice), 1 ether);
        assertEq(vault.totalDeposits(), 1 ether);
        assertEq(alice.balance, beforeBalance + 1 ether);
    }

    function testCannotWithdrawMoreThanOwnDeposit() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();

        vm.prank(alice);
        vm.expectRevert("Insufficient vault balance");
        vault.withdraw(2 ether);
    }

    function testCannotDepositZero() public {
        vm.prank(alice);
        vm.expectRevert("Deposit must be greater than zero");
        vault.deposit{value: 0}();
    }

    function testCannotWithdrawZero() public {
        vm.prank(alice);
        vm.expectRevert("Amount must be greater than zero");
        vault.withdraw(0);
    }
}
