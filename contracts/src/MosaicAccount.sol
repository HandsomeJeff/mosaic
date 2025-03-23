// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC1271.sol";
import "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "lib/erc6551/src/interfaces/IERC6551Account.sol";
import "lib/erc6551/src/interfaces/IERC6551Executable.sol";

/**
 * @title MosaicAccount
 * @dev Implementation of token bound account for AI agent NFTs
 */
contract MosaicAccount is IERC165, IERC1271, IERC6551Account, IERC6551Executable, ERC721Holder {
    using SafeERC20 for IERC20;
    
    // Storage for execution state
    uint256 public state;
    
    // Stores the chain ID at deployment to prevent cross-chain replay
    uint256 immutable deploymentChainId;
    
    // Define operations for execute function
    uint8 constant OPERATION_CALL = 0;
    uint8 constant OPERATION_DELEGATECALL = 1;
    uint8 constant OPERATION_CREATE = 2;
    uint8 constant OPERATION_CREATE2 = 3;
    
    // Events
    event TransactionExecuted(address indexed to, uint256 value, bytes data);
    event ERC20Received(address indexed token, uint256 value);
    event ERC721Received(address indexed token, uint256 tokenId);
    
    constructor() {
        deploymentChainId = block.chainid;
    }
    
    /**
     * @dev Allows the account to receive Ether
     */
    receive() external payable {}
    
    /**
     * @dev Executes a transaction from this account
     * @param to Target address
     * @param value Amount of Ether to send
     * @param data Call data
     * @param operation Type of operation (0=CALL, 1=DELEGATECALL, 2=CREATE, 3=CREATE2)
     * @return result Return data from the call
     */
    function execute(address to, uint256 value, bytes calldata data, uint8 operation)
        external
        payable
        virtual
        returns (bytes memory result)
    {
        require(_isValidSigner(msg.sender), "Invalid signer");
        
        // Increment state to prevent replay attacks
        ++state;
        
        if (operation == OPERATION_CALL) {
            bool success;
            (success, result) = to.call{value: value}(data);
            
            if (!success) {
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
            
            emit TransactionExecuted(to, value, data);
        } else if (operation == OPERATION_DELEGATECALL) {
            bool success;
            (success, result) = to.delegatecall(data);
            
            if (!success) {
                assembly {
                    revert(add(result, 32), mload(result))
                }
            }
            
            emit TransactionExecuted(to, value, data);
        } else if (operation == OPERATION_CREATE) {
            // Copy calldata to memory first
            bytes memory bytecode = data;
            address deployed;
            
            assembly {
                deployed := create(value, add(bytecode, 32), mload(bytecode))
            }
            
            require(deployed != address(0), "Contract creation failed");
            result = abi.encodePacked(deployed);
            emit TransactionExecuted(deployed, value, data);
        } else if (operation == OPERATION_CREATE2) {
            require(data.length >= 32, "Invalid salt");
            
            // Extract salt and bytecode
            bytes32 salt;
            bytes memory bytecode;
            
            assembly {
                // Load salt from the first 32 bytes of data
                salt := calldataload(data.offset)
                
                // Calculate size of the bytecode (data.length - 32 bytes for salt)
                let bytecodeSize := sub(data.length, 32)
                
                // Allocate memory for bytecode
                bytecode := mload(0x40) // Get free memory pointer
                mstore(bytecode, bytecodeSize) // Store length of bytecode
                
                // Update free memory pointer
                mstore(0x40, add(add(bytecode, 32), bytecodeSize))
                
                // Copy bytecode from calldata to memory
                calldatacopy(
                    add(bytecode, 32), // Target memory (after length)
                    add(data.offset, 32), // Source calldata (after salt)
                    bytecodeSize // Size of bytecode
                )
            }
            
            address deployed;
            assembly {
                deployed := create2(
                    value,
                    add(bytecode, 32), // Skip the length field
                    mload(bytecode),   // Length of bytecode
                    salt
                )
            }
            
            require(deployed != address(0), "Contract creation failed");
            result = abi.encodePacked(deployed);
            emit TransactionExecuted(deployed, value, data);
        } else {
            revert("Unsupported operation");
        }
    }
    
    /**
     * @dev Returns token information for this account
     * @return chainId Chain ID of the token
     * @return tokenContract Token contract address
     * @return tokenId Token ID
     */
    function token() public view virtual returns (uint256 chainId, address tokenContract, uint256 tokenId) {
        bytes memory footer = new bytes(0x60);
        
        assembly {
            // The token data is appended to the bytecode at deployment
            // Get the data from the last 96 bytes (0x60) of the contract account code
            let codeSize := extcodesize(address())
            extcodecopy(address(), add(footer, 0x20), sub(codeSize, 0x60), 0x60)
        }
        
        return abi.decode(footer, (uint256, address, uint256));
    }
    
    /**
     * @dev Returns the owner of the token bound to this account
     * @return owner Owner address
     */
    function owner() public view virtual returns (address) {
        (uint256 chainId, address tokenContract, uint256 tokenId) = token();
        if (chainId != deploymentChainId) return address(0);
        
        return IERC721(tokenContract).ownerOf(tokenId);
    }
    
    /**
     * @dev Validates if a signer is authorized to act on behalf of this account
     * @param signer Signer address to check
     * @param context Additional context data (unused in this implementation)
     * @return bytes4 Magic value if signer is valid
     */
    function isValidSigner(address signer, bytes calldata context) external view virtual returns (bytes4) {
        if (_isValidSigner(signer)) {
            return IERC6551Account.isValidSigner.selector;
        }
        
        return bytes4(0);
    }
    
    /**
     * @dev ERC1271 signature validation
     * @param hash Message hash
     * @param signature Signature bytes
     * @return bytes4 Magic value if signature is valid
     */
    function isValidSignature(bytes32 hash, bytes memory signature)
        external
        view
        virtual
        returns (bytes4)
    {
        bool isValid = SignatureChecker.isValidSignatureNow(owner(), hash, signature);
        
        if (isValid) {
            return IERC1271.isValidSignature.selector;
        }
        
        return bytes4(0);
    }
    
    /**
     * @dev ERC165 interface support
     * @param interfaceId Interface identifier
     * @return bool True if interface is supported
     */
    function supportsInterface(bytes4 interfaceId) external pure virtual returns (bool) {
        return interfaceId == type(IERC165).interfaceId
            || interfaceId == type(IERC6551Account).interfaceId
            || interfaceId == type(IERC6551Executable).interfaceId
            || interfaceId == type(IERC721Receiver).interfaceId;
    }
    
    /**
     * @dev Internal function to check if a signer is valid
     * @param signer Signer address to check
     * @return bool True if signer is valid
     */
    function _isValidSigner(address signer) internal view virtual returns (bool) {
        return signer == owner();
    }
} 