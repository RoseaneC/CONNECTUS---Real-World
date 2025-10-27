// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VEXAToken is ERC20, Ownable {
    event TokenMinted(address indexed to, uint256 amount);

    constructor() ERC20("VEXA Token", "VEXA") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "VEXAToken: mint to zero address");
        require(amount > 0, "VEXAToken: mint amount must be greater than zero");
        _mint(to, amount);
        emit TokenMinted(to, amount);
    }
}


