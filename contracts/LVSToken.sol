// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title LVS Token
 * @dev Implementation of the LVS ("Leaves") token for the Indoor Jungle game.
 * This token serves as the in-game currency for purchasing plants, pots, tools, and other items.
 */
contract LVSToken is ERC20, ERC20Burnable, Ownable {
    // Events
    event TokensMinted(address indexed to, uint256 amount);
    event TokensBurned(address indexed from, uint256 amount);
    
    // Maximum supply cap
    uint256 public immutable maxSupply;
    
    /**
     * @dev Constructor that initializes the token with name, symbol, and max supply
     * @param initialSupply The initial amount to mint to the contract creator
     * @param tokenMaxSupply The maximum amount of tokens that can ever be minted
     */
    constructor(uint256 initialSupply, uint256 tokenMaxSupply) 
        ERC20("Indoor Jungle Leaves", "LVS") 
        Ownable(msg.sender) 
    {
        require(initialSupply <= tokenMaxSupply, "Initial supply exceeds max supply");
        maxSupply = tokenMaxSupply;
        _mint(msg.sender, initialSupply * (10 ** decimals()));
    }
    
    /**
     * @dev Mints new tokens, respecting the max supply cap
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(totalSupply() + amount <= maxSupply, "Mint would exceed max supply");
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @dev Burns tokens from the caller's balance
     * @param amount The amount of tokens to burn
     */
    function burn(uint256 amount) public override {
        super.burn(amount);
        emit TokensBurned(msg.sender, amount);
    }
    
    /**
     * @dev Returns the number of decimals used for token amounts
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Allows for airdrops to multiple addresses in a single transaction
     * @param recipients Array of addresses to receive tokens
     * @param amounts Array of token amounts to distribute
     */
    function airdrop(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner {
        require(recipients.length == amounts.length, "Arrays must have the same length");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            totalAmount += amounts[i];
        }
        
        require(totalSupply() + totalAmount <= maxSupply, "Airdrop would exceed max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amounts[i]);
            emit TokensMinted(recipients[i], amounts[i]);
        }
    }
}