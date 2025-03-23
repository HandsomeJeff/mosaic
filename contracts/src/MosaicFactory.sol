// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MosaicAI.sol";
import "./MosaicAccount.sol";
import "lib/erc6551/src/interfaces/IERC6551Registry.sol";

/**
 * @title MosaicFactory
 * @dev Factory contract to deploy MosaicAI and MosaicAccount contracts
 */
contract MosaicFactory {
    // ERC6551 Registry address (constant across all chains)
    address public constant REGISTRY_ADDRESS = 0x000000006551c19487814612e58FE06813775758;
    
    // Deployed contracts
    MosaicAI public mosaicAI;
    MosaicAccount public accountImplementation;
    
    // Events
    event MosaicDeployed(address indexed mosaicAI, address indexed accountImplementation);
    event AgentCreated(uint256 indexed tokenId, address indexed account, address indexed owner);
    
    /**
     * @dev Deploy MosaicAI contract and account implementation
     * @param name Name for the MosaicAI NFT
     * @param symbol Symbol for the MosaicAI NFT
     */
    function deployMosaic(string memory name, string memory symbol) external returns (address) {
        // Deploy account implementation
        accountImplementation = new MosaicAccount();
        
        // Deploy MosaicAI contract
        mosaicAI = new MosaicAI(
            name, 
            symbol,
            REGISTRY_ADDRESS,
            address(accountImplementation)
        );
        
        emit MosaicDeployed(address(mosaicAI), address(accountImplementation));
        
        return address(mosaicAI);
    }
    
    /**
     * @dev Creates an AI agent NFT with token bound account
     * @param to Address to mint the NFT to
     * @param agentType Type of AI agent
     * @param tokenURI Metadata URI for the token
     * @param salt Salt for account creation
     * @return tokenId The ID of the minted token
     * @return account The address of the token bound account
     */
    function createAgent(
        address to,
        string memory agentType,
        string memory tokenURI,
        bytes32 salt
    ) external returns (uint256 tokenId, address account) {
        require(address(mosaicAI) != address(0), "Mosaic not deployed");
        
        // Mint AI agent NFT
        tokenId = mosaicAI.mint(to, agentType, tokenURI);
        
        // Create token bound account
        account = IERC6551Registry(REGISTRY_ADDRESS).createAccount(
            address(accountImplementation),
            salt,
            block.chainid,
            address(mosaicAI),
            tokenId
        );
        
        emit AgentCreated(tokenId, account, to);
        
        return (tokenId, account);
    }
    
    /**
     * @dev Returns the account address for an AI agent NFT
     * @param tokenId The ID of the token
     * @param salt Salt used for account creation
     * @return The address of the token bound account
     */
    function getAgentAccount(uint256 tokenId, bytes32 salt) external view returns (address) {
        require(address(mosaicAI) != address(0), "Mosaic not deployed");
        
        return IERC6551Registry(REGISTRY_ADDRESS).account(
            address(accountImplementation),
            salt,
            block.chainid,
            address(mosaicAI),
            tokenId
        );
    }
} 