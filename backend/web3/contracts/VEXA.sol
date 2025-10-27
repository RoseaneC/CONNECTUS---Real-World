// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VEXA is ERC20, Ownable {
    constructor() ERC20("VEXA COIN", "VEXA") Ownable(msg.sender) {
        _mint(msg.sender, 1_000_000e18);
    }
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

