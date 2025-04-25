// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./LVSToken.sol";

/**
 * @title IndoorJungleNFT
 * @dev Contract for creating and managing NFTs in the Indoor Jungle game
 * This includes plants, pots, tools, and other game items
 */
contract IndoorJungleNFT is ERC721URIStorage, ERC721Enumerable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // Reference to the LVS token contract
    LVSToken public lvsToken;
    
    // Enum for NFT types
    enum ItemType { Plant, Pot, Tool, Property }
    
    // NFT item structure
    struct Item {
        ItemType itemType;
        uint256 rarity;     // 1-5: Common, Uncommon, Rare, Epic, Legendary
        uint256 level;      // Growth level for plants, quality level for other items
        string attributes;  // JSON string of additional attributes
        uint256 price;      // Price in LVS tokens
    }
    
    // Mapping from token ID to Item data
    mapping(uint256 => Item) public items;
    
    // Events
    event ItemMinted(address indexed owner, uint256 indexed tokenId, ItemType itemType, uint256 price);
    event ItemSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    
    /**
     * @dev Constructor that sets the name and symbol of the token collection
     * @param lvsTokenAddress Address of the LVS token contract
     */
    constructor(address lvsTokenAddress) 
        ERC721("Indoor Jungle Items", "JUNGLE") 
        Ownable(msg.sender) 
    {
        lvsToken = LVSToken(lvsTokenAddress);
    }
    
    /**
     * @dev Creates a new NFT
     * @param recipient Address that will own the minted NFT
     * @param tokenURI URI for the NFT metadata
     * @param itemType Type of item (plant, pot, tool, property)
     * @param rarity Rarity level (1-5)
     * @param level Growth/quality level
     * @param attributes JSON string of additional attributes
     * @param price Price in LVS tokens
     * @return uint256 ID of the newly minted NFT
     */
    function mintItem(
        address recipient,
        string memory tokenURI,
        ItemType itemType,
        uint256 rarity,
        uint256 level,
        string memory attributes,
        uint256 price
    ) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        
        items[newItemId] = Item({
            itemType: itemType,
            rarity: rarity,
            level: level,
            attributes: attributes,
            price: price
        });
        
        emit ItemMinted(recipient, newItemId, itemType, price);
        
        return newItemId;
    }
    
    /**
     * @dev Purchases an NFT using LVS tokens
     * @param tokenId ID of the NFT to purchase
     */
    function purchaseItem(uint256 tokenId) public {
        address seller = ownerOf(tokenId);
        require(seller != msg.sender, "You already own this item");
        
        uint256 price = items[tokenId].price;
        require(price > 0, "Item not for sale");
        
        // Transfer LVS tokens from buyer to seller
        require(lvsToken.transferFrom(msg.sender, seller, price), "Token transfer failed");
        
        // Transfer NFT from seller to buyer
        _transfer(seller, msg.sender, tokenId);
        
        emit ItemSold(seller, msg.sender, tokenId, price);
    }
    
    /**
     * @dev Sets the price for an NFT
     * @param tokenId ID of the NFT
     * @param newPrice New price in LVS tokens (0 to remove from sale)
     */
    function setItemPrice(uint256 tokenId, uint256 newPrice) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        items[tokenId].price = newPrice;
    }
    
    /**
     * @dev Updates the level of an item (e.g., plant growth)
     * @param tokenId ID of the NFT
     * @param newLevel New level value
     */
    function updateItemLevel(uint256 tokenId, uint256 newLevel) public onlyOwner {
        require(_exists(tokenId), "Item does not exist");
        items[tokenId].level = newLevel;
    }
    
    /**
     * @dev Updates the attributes of an item
     * @param tokenId ID of the NFT
     * @param newAttributes New attributes JSON string
     */
    function updateItemAttributes(uint256 tokenId, string memory newAttributes) public onlyOwner {
        require(_exists(tokenId), "Item does not exist");
        items[tokenId].attributes = newAttributes;
    }
    
    /**
     * @dev Get all token IDs owned by an address
     * @param owner Address to query
     * @return uint256[] Array of token IDs
     */
    function getTokensByOwner(address owner) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        
        for (uint256 i = 0; i < tokenCount; i++) {
            tokenIds[i] = tokenOfOwnerByIndex(owner, i);
        }
        
        return tokenIds;
    }
    
    // Required overrides due to multiple inheritance
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }
    
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}