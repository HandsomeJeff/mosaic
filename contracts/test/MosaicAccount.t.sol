// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MosaicAccount.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC6551Registry} from "lib/erc6551/src/ERC6551Registry.sol";
import {IERC6551Account} from "lib/erc6551/src/interfaces/IERC6551Account.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "./helpers/MosaicTestHelpers.sol";

contract MockNFT is ERC721 {
    constructor() ERC721("MockToken", "MTK") {}
    
    function mint(address to, uint256 tokenId) external {
        _mint(to, tokenId);
    }
}

contract MosaicAccountTest is Test {
    MosaicAccount internal account;
    MockNFT internal mockNFT;
    ERC6551Registry internal registry;
    address internal owner;
    address internal nonOwner;
    uint256 internal tokenId;
    bytes32 internal salt;

    event TransactionExecuted(address indexed to, uint256 value, bytes data);
    
    function setUp() public {
        // Deploy registry and NFT
        registry = new ERC6551Registry();
        mockNFT = new MockNFT();
        
        // Setup accounts
        owner = makeAddr("owner");
        nonOwner = makeAddr("nonOwner");
        tokenId = 1;
        salt = bytes32(0);
        
        // Mint NFT to owner
        mockNFT.mint(owner, tokenId);
        
        // Deploy account implementation
        account = new MosaicAccount();
        
        // Create token bound account
        address payable accountAddress = payable(registry.createAccount(
            address(account),
            salt,
            block.chainid,
            address(mockNFT),
            tokenId
        ));
        
        // Use this account for tests
        account = MosaicAccount(accountAddress);
    }
    
    function test_AccountOwnership() public {
        assertEq(account.owner(), owner, "Owner should be the NFT owner");
    }
    
    function test_IsValidSigner() public {
        bytes4 magicValue = account.isValidSigner(owner, "");
        assertEq(magicValue, IERC6551Account.isValidSigner.selector, "Owner should be a valid signer");
        
        magicValue = account.isValidSigner(nonOwner, "");
        assertEq(magicValue, bytes4(0), "Non-owner should not be a valid signer");
    }
    
    function test_TokenInfo() public {
        (uint256 chainId, address tokenContract, uint256 nftId) = account.token();
        assertEq(chainId, block.chainid, "Chain ID should match current chain");
        assertEq(tokenContract, address(mockNFT), "Token contract should match");
        assertEq(nftId, tokenId, "Token ID should match");
    }
    
    function test_ExecuteCall() public {
        // Create a test contract to call
        TestStorage storageContract = new TestStorage();
        uint256 testValue = 42;
        
        // Create calldata to set the value
        bytes memory callData = abi.encodeWithSignature("setValue(uint256)", testValue);
        
        // Execute transaction as owner
        vm.prank(owner);
        vm.expectEmit(true, true, false, true);
        emit TransactionExecuted(address(storageContract), 0, callData);
        bytes memory result = account.execute(address(storageContract), 0, callData, 0);
        
        // Verify value was set
        assertEq(storageContract.value(), testValue, "Value should be set correctly");
        assertEq(account.state(), 1, "State should be incremented");
    }
    
    function test_ExecuteCall_RevertIfNotOwner() public {
        TestStorage storageContract = new TestStorage();
        bytes memory callData = abi.encodeWithSignature("setValue(uint256)", 42);
        
        // Execute transaction as non-owner (should fail)
        vm.prank(nonOwner);
        vm.expectRevert("Invalid signer");
        account.execute(address(storageContract), 0, callData, 0);
    }
    
    function test_ExecuteDelegateCall() public {
        // Create a test contract to delegatecall
        DelegateCallTestHelper delegateContract = new DelegateCallTestHelper();
        
        // Execute transaction as owner
        vm.prank(owner);
        bytes memory result = account.execute(
            address(delegateContract), 
            0, 
            abi.encodeWithSignature("updateState()"), 
            1 // DELEGATECALL
        );
        
        // Verify state was updated via delegatecall
        assertEq(account.state(), 999, "State should be updated via delegatecall");
    }
    
    function test_ExecuteCreate() public {
        bytes memory bytecode = type(TestStorage).creationCode;
        
        // Execute transaction as owner to create a contract
        vm.prank(owner);
        bytes memory result = account.execute(
            address(0), 
            0, 
            bytecode, 
            2 // CREATE
        );
        
        // Verify contract was created
        address deployedAddress = abi.decode(result, (address));
        assertTrue(deployedAddress != address(0), "Contract should be deployed");
        
        // Verify created contract works
        TestStorage storageContract = TestStorage(deployedAddress);
        assertEq(storageContract.value(), 0, "Initial value should be 0");
        
        // Test the deployed contract
        storageContract.setValue(123);
        assertEq(storageContract.value(), 123, "Value should be updated");
    }
    
    function test_ExecuteCreate2() public {
        bytes32 create2Salt = bytes32(uint256(123));
        bytes memory bytecode = type(TestStorage).creationCode;
        
        // Prepare data with salt + bytecode
        bytes memory data = abi.encodePacked(create2Salt, bytecode);
        
        // Execute transaction as owner to create a contract with CREATE2
        vm.prank(owner);
        bytes memory result = account.execute(
            address(0), 
            0, 
            data, 
            3 // CREATE2
        );
        
        // Verify contract was created
        address deployedAddress = abi.decode(result, (address));
        assertTrue(deployedAddress != address(0), "Contract should be deployed");
        
        // Calculate expected address
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(account),
                create2Salt,
                keccak256(bytecode)
            )
        );
        address expectedAddress = address(uint160(uint256(hash)));
        
        // Verify address matches expected
        assertEq(deployedAddress, expectedAddress, "Deployed address should match calculated address");
    }
    
    function test_ReceiveEther() public {
        // Send ether to account
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);
        (bool success,) = address(account).call{value: amount}("");
        assertTrue(success, "Account should receive ether");
        assertEq(address(account).balance, amount, "Account balance should match sent amount");
    }
    
    function test_SupportsInterface() public {
        assertTrue(account.supportsInterface(type(IERC165).interfaceId), "Should support IERC165");
        assertTrue(account.supportsInterface(type(IERC6551Account).interfaceId), "Should support IERC6551Account");
        assertTrue(account.supportsInterface(type(IERC6551Executable).interfaceId), "Should support IERC6551Executable");
        assertTrue(account.supportsInterface(type(IERC721Receiver).interfaceId), "Should support IERC721Receiver");
    }
    
    function test_IsValidSignature() public {
        bytes32 hash = keccak256("test message");
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(uint256(1), hash);
        bytes memory signature = abi.encodePacked(r, s, v);
        
        // Mock the owner address to match the signer
        address signer = vm.addr(uint256(1));
        mockNFT.mint(signer, 2);
        
        address payable accountAddress2 = payable(registry.createAccount(
            address(account),
            bytes32(uint256(1)),
            block.chainid,
            address(mockNFT),
            2
        ));
        MosaicAccount otherAccount = MosaicAccount(accountAddress2);
        
        bytes4 returnValue = otherAccount.isValidSignature(hash, signature);
        assertEq(returnValue, IERC1271.isValidSignature.selector, "Should validate signature from owner");
    }
} 