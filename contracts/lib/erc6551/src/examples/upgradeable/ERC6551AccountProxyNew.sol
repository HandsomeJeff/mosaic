// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol";
import "@openzeppelin/contracts/proxy/Proxy.sol";

error InvalidImplementation();

contract ERC6551AccountProxy is Proxy {
    address immutable defaultImplementation;

    constructor(address _defaultImplementation) {
        if (_defaultImplementation == address(0)) revert InvalidImplementation();
        defaultImplementation = _defaultImplementation;
    }

    function _implementation() internal view virtual override returns (address) {
        address implementation = ERC1967Utils.getImplementation();

        if (implementation == address(0)) return defaultImplementation;

        return implementation;
    }
}
