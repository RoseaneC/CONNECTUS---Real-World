// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VexaTreasury is Ownable {
    IERC20 public vexa;
    mapping(bytes32 => bool) public usedProof;

    constructor(address token) Ownable(msg.sender) { 
        vexa = IERC20(token); 
    }

    function reward(address to, uint256 amount, bytes32 proof) external onlyOwner {
        require(!usedProof[proof], "already used");
        usedProof[proof] = true;
        require(vexa.transfer(to, amount), "transfer failed");
    }
}

