// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/MosaicFactory.sol";
import "../src/MosaicAI.sol";
import "../src/MosaicAccount.sol";
import {ERC6551Registry} from "lib/erc6551/src/ERC6551Registry.sol";
import {IERC6551Account} from "lib/erc6551/src/interfaces/IERC6551Account.sol";
import {IERC6551Executable} from "lib/erc6551/src/interfaces/IERC6551Executable.sol";
import "./helpers/MosaicTestHelpers.sol";

contract MosaicFactoryTest is Test {
    MosaicFactory internal factory;
    address internal owner;
    address internal user;
    
    // Test constants
    string internal constant NAME = "Mosaic AI";
    string internal constant SYMBOL = "MAI";
    bytes32 internal constant SALT = bytes32(0);
    
    // Events to test
    event MosaicDeployed(address indexed mosaicAI, address indexed accountImplementation);
    event AgentCreated(uint256 indexed tokenId, address indexed account, address indexed owner);
    
    function setUp() public {
        // Setup accounts
        owner = makeAddr("owner");
        user = makeAddr("user");
        
        // Deploy factory
        vm.prank(owner);
        factory = new MosaicFactory();
    }
    
    function test_DeployMosaic() public {
        // Expect MosaicDeployed event
        vm.expectEmit(true, true, false, false);
        // We don't know exact addresses until after deployment
        emit MosaicDeployed(address(0), address(0));
        
        // Deploy Mosaic contracts
        address mosaicAIAddress = factory.deployMosaic(NAME, SYMBOL);
        
        // Verify deployment
        assertTrue(mosaicAIAddress != address(0), "MosaicAI should be deployed");
        assertTrue(address(factory.mosaicAI()) == mosaicAIAddress, "Factory mosaicAI should match returned address");
        assertTrue(address(factory.accountImplementation()) != address(0), "Account implementation should be deployed");
        
        // Verify MosaicAI initialization
        MosaicAI mosaicAI = MosaicAI(mosaicAIAddress);
        assertEq(mosaicAI.name(), NAME, "MosaicAI name should match");
        assertEq(mosaicAI.symbol(), SYMBOL, "MosaicAI symbol should match");
        assertEq(mosaicAI.registry(), factory.REGISTRY_ADDRESS(), "MosaicAI registry should match factory registry");
        assertEq(mosaicAI.accountImplementation(), address(factory.accountImplementation()), "MosaicAI account implementation should match");
    }
    
    function test_CreateAgent() public {
        // First deploy Mosaic contracts
        factory.deployMosaic(NAME, SYMBOL);
        
        string memory agentType = "assistant";
        string memory tokenURI = "ipfs://QmTest";
        
        // Expect AgentCreated event (we don't know tokenId and account address yet)
        vm.expectEmit(true, true, true, false);
        emit AgentCreated(0, address(0), user);
        
        // Create agent
        (uint256 tokenId, address account) = factory.createAgent(user, agentType, tokenURI, SALT);
        
        // Verify tokenId
        assertEq(tokenId, 0, "First token ID should be 0");
        
        // Verify token ownership
        MosaicAI mosaicAI = factory.mosaicAI();
        assertEq(mosaicAI.ownerOf(tokenId), user, "Token owner should be user");
        assertEq(mosaicAI.agentType(tokenId), agentType, "Agent type should match");
        assertEq(mosaicAI.tokenURI(tokenId), tokenURI, "Token URI should match");
        
        // Verify account address
        address expectedAccount = ERC6551Registry(factory.REGISTRY_ADDRESS()).account(
            address(factory.accountImplementation()),
            SALT,
            block.chainid,
            address(mosaicAI),
            tokenId
        );
        assertEq(account, expectedAccount, "Account address should match expected");
        
        // Verify account ownership
        MosaicAccount tokenAccount = MosaicAccount(payable(account));
        assertEq(tokenAccount.owner(), user, "Account owner should be the token owner");
    }
    
    function test_CreateMultipleAgents() public {
        // First deploy Mosaic contracts
        factory.deployMosaic(NAME, SYMBOL);
        
        // Create first agent
        (uint256 tokenId1, address account1) = factory.createAgent(user, "assistant", "ipfs://token1", SALT);
        
        // Create second agent with different salt
        bytes32 salt2 = bytes32(uint256(1));
        (uint256 tokenId2, address account2) = factory.createAgent(user, "researcher", "ipfs://token2", salt2);
        
        // Verify token IDs
        assertEq(tokenId1, 0, "First token ID should be 0");
        assertEq(tokenId2, 1, "Second token ID should be 1");
        
        // Verify accounts are different
        assertTrue(account1 != account2, "Accounts should be different");
        
        // Verify both owned by user
        MosaicAccount tokenAccount1 = MosaicAccount(payable(account1));
        MosaicAccount tokenAccount2 = MosaicAccount(payable(account2));
        assertEq(tokenAccount1.owner(), user, "First account owner should be user");
        assertEq(tokenAccount2.owner(), user, "Second account owner should be user");
    }
    
    function test_GetAgentAccount() public {
        // First deploy Mosaic contracts
        factory.deployMosaic(NAME, SYMBOL);
        
        // Create agent
        (uint256 tokenId, address account) = factory.createAgent(user, "assistant", "ipfs://token", SALT);
        
        // Get account address via getter
        address retrievedAccount = factory.getAgentAccount(tokenId, SALT);
        
        // Verify address
        assertEq(retrievedAccount, account, "Retrieved account should match created account");
    }
    
    function test_CreateAgentRevertIfNotDeployed() public {
        // Try to create agent without deploying contracts first
        vm.expectRevert("Mosaic not deployed");
        factory.createAgent(user, "assistant", "ipfs://token", SALT);
    }
    
    function test_GetAgentAccountRevertIfNotDeployed() public {
        // Try to get agent account without deploying contracts first
        vm.expectRevert("Mosaic not deployed");
        factory.getAgentAccount(0, SALT);
    }
    
    function test_AccountCanReceiveEther() public {
        // Deploy Mosaic contracts
        factory.deployMosaic(NAME, SYMBOL);
        
        // Create agent
        (uint256 tokenId, address account) = factory.createAgent(user, "assistant", "ipfs://token", SALT);
        
        // Send ether to account
        uint256 amount = 1 ether;
        vm.deal(address(this), amount);
        (bool success,) = account.call{value: amount}("");
        assertTrue(success, "Account should receive ether");
        assertEq(address(account).balance, amount, "Account balance should match sent amount");
    }
    
    function test_TokenOwnerCanExecuteTransactions() public {
        // Deploy Mosaic contracts
        factory.deployMosaic(NAME, SYMBOL);
        
        // Create agent
        (uint256 tokenId, address account) = factory.createAgent(user, "assistant", "ipfs://token", SALT);
        
        // Create storage contract to interact with
        TestStorage storageContract = new TestStorage();
        uint256 testValue = 42;
        
        // Execute transaction as token owner
        vm.prank(user);
        MosaicAccount(payable(account)).execute(
            address(storageContract),
            0,
            abi.encodeWithSignature("setValue(uint256)", testValue),
            0 // CALL operation
        );
        
        // Verify value was set
        assertEq(storageContract.value(), testValue, "Value should be set correctly");
    }
} 