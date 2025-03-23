# Mosaic AI - Test Suite

This directory contains tests for the Mosaic AI smart contracts using Foundry's testing framework.

## Overview

These tests cover the three main contracts in the system:

1. **MosaicAccount.t.sol**: Tests for the token bound account implementation
2. **MosaicAI.t.sol**: Tests for the NFT contract representing AI agents
3. **MosaicFactory.t.sol**: Tests for the factory contract that deploys the system

## Running Tests

To run the tests, you need to have Foundry installed. If you don't have it already, follow the instructions at [Foundry Book](https://book.getfoundry.sh/getting-started/installation).

### Running all tests

```bash
forge test
```

### Running tests with verbosity

```bash
forge test -vv
```

### Running a specific test file

```bash
forge test --match-path test/MosaicAccount.t.sol
forge test --match-path test/MosaicAI.t.sol
forge test --match-path test/MosaicFactory.t.sol
```

### Running a specific test function

```bash
forge test --match-test test_ExecuteCall
```

## Test Coverage

To check test coverage:

```bash
forge coverage
```

## Notes on Tests

1. You may encounter duplicate identifier warnings when running tests. This is due to imports of the same files across test files. This doesn't affect test functionality.

2. The tests use several mock contracts to simulate interactions:
   - `MockNFT` for simulating ERC721 tokens
   - Helper storage contracts for testing execution mechanisms

3. Tests extensively use Foundry's cheatcodes like `vm.prank()`, `vm.expectEmit()`, and `vm.deal()` to simulate various conditions.

4. These tests cover normal operation as well as edge cases and error conditions. 