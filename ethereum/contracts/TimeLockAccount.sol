pragma solidity ^0.4.24;

contract TimeLockAccount {
    address private owner;
    uint private blockHeightStart;
    uint private blockHeightToLockUntil;
    bool deposited;
    
    modifier ownerAccess() {
        require(msg.sender == owner);
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    function deposit(uint _blockHeightDeltaToLockUntil) public payable ownerAccess {
        require(!deposited, "Already made deposit.");
        deposited = true;
        blockHeightStart = block.number;
        blockHeightToLockUntil = _blockHeightDeltaToLockUntil + blockHeightStart;
    }
    
    function withdraw() public ownerAccess {
        require(deposited, "No deposit made yet.");
        require(block.number >= blockHeightToLockUntil, "Block height has not surpassed lock time.");
        owner.transfer(address(this).balance);
    }
    
    function getLockHeight() public view ownerAccess returns (uint) {
        return blockHeightToLockUntil;
    }
    
    function getHeightStarted() public view ownerAccess returns (uint) {
        return blockHeightStart;
    }
    
    function getCurrentHeight() external view returns (uint) {
        return block.number;
    }
    
    function getBalance() public view ownerAccess returns (uint) {
        return address(this).balance;
    }
}
