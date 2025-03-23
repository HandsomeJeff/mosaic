// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "lib/erc6551/src/interfaces/IERC6551Registry.sol";

/**
 * @title MosaicAI
 * @dev ERC721 NFT contract for AI agents where each NFT can have its own token bound account
 */
contract MosaicAI is ERC721Enumerable, Ownable {
    // Next token ID to mint
    uint256 private _nextTokenId;
    
    // Metadata URI for each token
    mapping(uint256 => string) private _tokenURIs;
    
    // AI Agent type (can be extended with more properties)
    mapping(uint256 => string) private _agentTypes;
    
    // Registry for ERC6551 token bound accounts
    address public immutable registry;
    
    // Implementation for token bound accounts
    address public accountImplementation;
    
    // Events
    event AIAgentCreated(uint256 indexed tokenId, string agentType, address indexed owner);
    event TokenBoundAccountCreated(uint256 indexed tokenId, address indexed account);
    
    constructor(
        string memory name, 
        string memory symbol,
        address _registry,
        address _accountImplementation
    ) ERC721(name, symbol) Ownable(msg.sender) {
        registry = _registry;
        accountImplementation = _accountImplementation;
    }
    
    /**
     * @dev Sets a new implementation for token bound accounts
     * @param newImplementation Address of the new implementation
     */
    function setAccountImplementation(address newImplementation) external onlyOwner {
        accountImplementation = newImplementation;
    }
    
    /**
     * @dev Mints a new AI agent NFT
     * @param to Address to mint the NFT to
     * @param agentType_ Type of AI agent
     * @param tokenURI_ Metadata URI for the token
     * @return tokenId The ID of the minted token
     */
    function mint(address to, string memory agentType_, string memory tokenURI_) public returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        _agentTypes[tokenId] = agentType_;
        _tokenURIs[tokenId] = tokenURI_;
        
        emit AIAgentCreated(tokenId, agentType_, to);
        
        return tokenId;
    }
    
    /**
     * @dev Creates a token bound account for an AI agent NFT
     * @param tokenId The ID of the token to create an account for
     * @param salt Salt for account creation
     * @return account The address of the created token bound account
     */
    function createTokenBoundAccount(uint256 tokenId, bytes32 salt) external returns (address) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        address account = IERC6551Registry(registry).createAccount(
            accountImplementation,
            salt,
            block.chainid,
            address(this),
            tokenId
        );
        
        emit TokenBoundAccountCreated(tokenId, account);
        
        return account;
    }
    
    /**
     * @dev Returns the address of the token bound account for an AI agent NFT
     * @param tokenId The ID of the token
     * @param salt Salt used for account creation
     * @return The address of the token bound account
     */
    function tokenBoundAccount(uint256 tokenId, bytes32 salt) external view returns (address) {
        return IERC6551Registry(registry).account(
            accountImplementation,
            salt,
            block.chainid,
            address(this),
            tokenId
        );
    }
    
    /**
     * @dev Returns the type of an AI agent
     * @param tokenId The ID of the token
     * @return The type of the AI agent
     */
    function agentType(uint256 tokenId) external view returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _agentTypes[tokenId];
    }
    
    /**
     * @dev Returns the metadata URI of a token
     * @param tokenId The ID of the token
     * @return The metadata URI
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return _tokenURIs[tokenId];
    }
} 