// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MiniVault} from "../contracts/MiniVault.sol";

contract ReentrantWithdrawer {
    MiniVault public immutable vault;
    bool public reentryBlocked;

    constructor(MiniVault _vault) {
        vault = _vault;
    }

    function depositToVault() external payable {
        vault.deposit{value: msg.value}();
    }

    function withdrawFromVault(uint256 amount) external {
        vault.withdraw(amount);
    }

    receive() external payable {
        try vault.withdraw(1 wei) {
            revert("Reentrant withdrawal unexpectedly succeeded");
        } catch {
            reentryBlocked = true;
        }
    }
}

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
        assertEq(address(vault).balance, vault.totalDeposits());
    }

    function testDepositEmitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit MiniVault.Deposited(alice, 1 ether);
        vault.deposit{value: 1 ether}();
    }

    function testWithdrawOwnDeposit() public {
        vm.prank(alice);
        vault.deposit{value: 2 ether}();

        uint256 beforeBalance = alice.balance;
        vm.prank(alice);
        vm.expectEmit(true, false, false, true);
        emit MiniVault.Withdrawn(alice, 1 ether);
        vault.withdraw(1 ether);

        assertEq(vault.balances(alice), 1 ether);
        assertEq(vault.totalDeposits(), 1 ether);
        assertEq(alice.balance, beforeBalance + 1 ether);
        assertEq(address(vault).balance, vault.totalDeposits());
    }

    function testUsersCannotWithdrawEachOthersDeposits() public {
        vm.prank(alice);
        vault.deposit{value: 1 ether}();

        vm.prank(bob);
        vm.expectRevert("Insufficient vault balance");
        vault.withdraw(1 ether);

        assertEq(vault.balances(alice), 1 ether);
        assertEq(vault.balances(bob), 0);
        assertEq(vault.totalDeposits(), 1 ether);
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

    function testReentrantWithdrawalIsBlocked() public {
        ReentrantWithdrawer attacker = new ReentrantWithdrawer(vault);
        vm.deal(address(attacker), 2 ether);

        attacker.depositToVault{value: 2 ether}();
        attacker.withdrawFromVault(1 ether);

        assertTrue(attacker.reentryBlocked());
        assertEq(vault.balances(address(attacker)), 1 ether);
        assertEq(vault.totalDeposits(), 1 ether);
        assertEq(address(vault).balance, 1 ether);
    }
}
