# Mosaic AI - ERC6551 Implementation

This project implements a system for AI agents using the ERC6551 (Token Bound Accounts) standard. Each AI agent is represented as an NFT, and each NFT has its own account that can hold assets and interact with other contracts.

## Overview

The Mosaic AI system consists of the following components:

1. **MosaicAI.sol**: An ERC721 NFT contract that represents AI agents
2. **MosaicAccount.sol**: An implementation of the ERC6551Account interface that provides smart contract account functionality to the NFTs
3. **MosaicFactory.sol**: A factory contract that simplifies the deployment and usage of the system

## How It Works

1. A user deploys the system using the `MosaicFactory`
2. The factory deploys the `MosaicAI` NFT contract and `MosaicAccount` implementation
3. When a user mints an AI agent NFT, they can also create a token bound account for it
4. The token bound account can hold assets (ETH, ERC20, ERC721) and execute transactions
5. The owner of the NFT has control over the token bound account

## Contracts

### MosaicAI

This contract implements the ERC721 standard and represents AI agents as NFTs. Each NFT has:
- A unique token ID
- An agent type (e.g., "assistant", "researcher", "analyst")
- A metadata URI pointing to the agent's characteristics

### MosaicAccount

This is the implementation of the token bound account following the ERC6551 standard. It:
- Can receive and hold ETH
- Can hold ERC20 and ERC721 tokens
- Can execute transactions as directed by the NFT owner
- Validates signatures using the NFT owner's address

### MosaicFactory

A factory contract that simplifies deployment and interaction:
- Deploys the MosaicAI and MosaicAccount contracts
- Provides helper functions to create agent NFTs with token bound accounts
- Provides a way to retrieve the token bound account for any agent NFT

## Usage

### Deployment

```solidity
// Deploy the factory
MosaicFactory factory = new MosaicFactory();

// Deploy the Mosaic AI system
factory.deployMosaic("Mosaic AI Agents", "MAI");
```

### Creating an AI Agent

```solidity
// Create an AI agent with a token bound account
(uint256 tokenId, address account) = factory.createAgent(
    userAddress,
    "assistant",
    "ipfs://<metadata-URI>",
    bytes32(0) // salt
);
```

### Using the Token Bound Account

```solidity
// Get the account instance
MosaicAccount agentAccount = MosaicAccount(payable(account));

// Execute a transaction from the account (must be called by the NFT owner)
agentAccount.execute(
    targetAddress,
    value,
    calldata,
    0 // CALL operation
);
```

## ERC6551 Compatibility

This implementation follows the ERC6551 standard:
- It uses the standard registry at `0x000000006551c19487814612e58FE06813775758`
- The account implementation implements the required interfaces: `IERC6551Account` and `IERC6551Executable`
- The account can be controlled by the owner of the corresponding NFT
- The account can hold assets and execute transactions

## Important Notes

- The owner of the AI agent NFT has full control over the token bound account
- When transferring an AI agent NFT, control of the token bound account is also transferred to the new owner
- The system does not prevent ownership cycles (an NFT owning its own token bound account), which should be handled at the application level 