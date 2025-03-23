// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Helper contract for storage testing
contract TestStorage {
    uint256 public value;
    
    function setValue(uint256 newValue) external {
        value = newValue;
    }
}

// Helper contract for delegatecall testing
contract DelegateCallTestHelper {
    uint256 public state;
    uint256 private dummyVar;
    
    function updateState() external {
        state = 999;
    }
} 