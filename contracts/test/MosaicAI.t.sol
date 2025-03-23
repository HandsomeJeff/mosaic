// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MosaicAI.sol";
import "../src/MosaicAccount.sol";
import {ERC6551Registry} from "lib/erc6551/src/ERC6551Registry.sol";
import {IERC6551Account} from "lib/erc6551/src/interfaces/IERC6551Account.sol";
import {IERC6551Executable} from "lib/erc6551/src/interfaces/IERC6551Executable.sol";
import "./helpers/MosaicTestHelpers.sol";

contract MosaicAITest is Test {
    MosaicAI internal mosaicAI;
    MosaicAccount internal accountImplementation;
    ERC6551Registry internal registry;
    
    address internal owner;
    address internal user1;
    address internal user2;
    
    // Test constants
    string internal constant NAME = "Mosaic AI";
    string internal constant SYMBOL = "MAI";
    bytes32 internal constant SALT = bytes32(0);
    
    // Events to test
    event AIAgentCreated(uint256 indexed tokenId, string agentType, address indexed owner);
    event TokenBoundAccountCreated(uint256 indexed tokenId, address indexed account);
    
    function setUp() public {
        // Deploy registry
        registry = new ERC6551Registry();
        
        // Deploy account implementation
        accountImplementation = new MosaicAccount();
        
        // Setup accounts
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy MosaicAI contract
        vm.prank(owner);
        mosaicAI = new MosaicAI(
            NAME,
            SYMBOL,
            address(registry),
            address(accountImplementation)
        );
    }
    
    function test_Initialization() public {
        assertEq(mosaicAI.name(), NAME, "Contract name should match");
        assertEq(mosaicAI.symbol(), SYMBOL, "Contract symbol should match");
        assertEq(mosaicAI.registry(), address(registry), "Registry should match");
        assertEq(mosaicAI.accountImplementation(), address(accountImplementation), "Account implementation should match");
        assertEq(mosaicAI.owner(), owner, "Owner should be set correctly");
    }
    
    function test_MintToken() public {
        string memory agentType = "assistant";
        string memory tokenURI = "ipfs://QmTest";
        
        // Expect AIAgentCreated event
        vm.expectEmit(true, false, true, true);
        emit AIAgentCreated(0, agentType, user1);
        
        // Mint token
        uint256 tokenId = mosaicAI.mint(user1, agentType, tokenURI);
        
        // Verify token
        assertEq(tokenId, 0, "First token ID should be 0");
        assertEq(mosaicAI.ownerOf(tokenId), user1, "Owner of token should be user1");
        assertEq(mosaicAI.tokenURI(tokenId), tokenURI, "Token URI should match");
        assertEq(mosaicAI.agentType(tokenId), agentType, "Agent type should match");
        assertEq(mosaicAI.balanceOf(user1), 1, "User1 should have 1 token");
    }
    
    function test_MintMultipleTokens() public {
        // Mint first token
        uint256 tokenId1 = mosaicAI.mint(user1, "assistant", "ipfs://token1");
        
        // Mint second token
        uint256 tokenId2 = mosaicAI.mint(user2, "researcher", "ipfs://token2");
        
        // Verify tokens
        assertEq(tokenId1, 0, "First token ID should be 0");
        assertEq(tokenId2, 1, "Second token ID should be 1");
        assertEq(mosaicAI.ownerOf(tokenId1), user1, "Owner of first token should be user1");
        assertEq(mosaicAI.ownerOf(tokenId2), user2, "Owner of second token should be user2");
        assertEq(mosaicAI.agentType(tokenId1), "assistant", "First agent type should match");
        assertEq(mosaicAI.agentType(tokenId2), "researcher", "Second agent type should match");
    }
    
    function test_TokenTransfer() public {
        // Mint token
        uint256 tokenId = mosaicAI.mint(user1, "assistant", "ipfs://token");
        
        // Transfer token
        vm.prank(user1);
        mosaicAI.transferFrom(user1, user2, tokenId);
        
        // Verify ownership
        assertEq(mosaicAI.ownerOf(tokenId), user2, "Token should be transferred to user2");
        assertEq(mosaicAI.balanceOf(user1), 0, "User1 should have 0 tokens");
        assertEq(mosaicAI.balanceOf(user2), 1, "User2 should have 1 token");
    }
    
    function test_CreateTokenBoundAccount() public {
        // Mint token
        uint256 tokenId = mosaicAI.mint(user1, "assistant", "ipfs://token");
        
        // Calculate expected account address
        address expectedAccount = registry.account(
            address(accountImplementation),
            SALT,
            block.chainid,
            address(mosaicAI),
            tokenId
        );
        
        // Expect TokenBoundAccountCreated event
        vm.expectEmit(true, true, false, false);
        emit TokenBoundAccountCreated(tokenId, expectedAccount);
        
        // Create token bound account
        address accountAddress = mosaicAI.createTokenBoundAccount(tokenId, SALT);
        
        // Verify account address
        assertEq(accountAddress, expectedAccount, "Account address should match expected");
        
        // Verify account ownership
        MosaicAccount account = MosaicAccount(payable(accountAddress));
        assertEq(account.owner(), user1, "Account owner should be the token owner");
        
        // Verify token information
        (uint256 chainId, address tokenContract, uint256 tokenId_) = account.token();
        assertEq(chainId, block.chainid, "Chain ID should match");
        assertEq(tokenContract, address(mosaicAI), "Token contract should match");
        assertEq(tokenId_, tokenId, "Token ID should match");
    }
    
    function test_TokenBoundAccountAddress() public {
        // Mint token
        uint256 tokenId = mosaicAI.mint(user1, "assistant", "ipfs://token");
        
        // Get token bound account address
        address accountAddress = mosaicAI.tokenBoundAccount(tokenId, SALT);
        
        // Verify account address
        address expectedAccount = registry.account(
            address(accountImplementation),
            SALT,
            block.chainid,
            address(mosaicAI),
            tokenId
        );
        assertEq(accountAddress, expectedAccount, "Account address should match expected");
    }
    
    function test_SetAccountImplementation() public {
        // Deploy new account implementation
        MosaicAccount newImplementation = new MosaicAccount();
        
        // Set new implementation (only owner should be able to do this)
        vm.prank(owner);
        mosaicAI.setAccountImplementation(address(newImplementation));
        
        // Verify implementation was updated
        assertEq(mosaicAI.accountImplementation(), address(newImplementation), "Account implementation should be updated");
    }
    
    function test_SetAccountImplementation_RevertIfNotOwner() public {
        // Deploy new account implementation
        MosaicAccount newImplementation = new MosaicAccount();
        
        // Try to set new implementation as non-owner (should fail)
        vm.prank(user1);
        vm.expectRevert("Ownable: caller is not the owner");
        mosaicAI.setAccountImplementation(address(newImplementation));
    }
    
    function test_TokenURIRevertIfNonexistent() public {
        // Try to get URI for nonexistent token
        vm.expectRevert("Token does not exist");
        mosaicAI.tokenURI(999);
    }
    
    function test_AgentTypeRevertIfNonexistent() public {
        // Try to get agent type for nonexistent token
        vm.expectRevert("Token does not exist");
        mosaicAI.agentType(999);
    }
    
    function test_CreateAccountRevertIfNonexistent() public {
        // Try to create account for nonexistent token
        vm.expectRevert("Token does not exist");
        mosaicAI.createTokenBoundAccount(999, SALT);
    }
    
    function test_TokenTransferUpdatesAccountOwnership() public {
        // Mint token
        uint256 tokenId = mosaicAI.mint(user1, "assistant", "ipfs://token");
        
        // Create token bound account
        address accountAddress = mosaicAI.createTokenBoundAccount(tokenId, SALT);
        MosaicAccount account = MosaicAccount(payable(accountAddress));
        
        // Verify initial ownership
        assertEq(account.owner(), user1, "Initial account owner should be user1");
        
        // Transfer token
        vm.prank(user1);
        mosaicAI.transferFrom(user1, user2, tokenId);
        
        // Verify account ownership is updated
        assertEq(account.owner(), user2, "Account owner should now be user2");
    }
} 