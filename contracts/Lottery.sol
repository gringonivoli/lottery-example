// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract Lottery {

    string name;
    uint ticketCost;
    address manager;

    constructor(string memory _name, address _manager) {
        name = _name;
        manager = _manager;
    }

    modifier OnlyManager() {
        require(manager == msg.sender);
        _;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function activate(uint _ticketCost) public OnlyManager {
        ticketCost = _ticketCost;
    }

    function getTicketCost() public view returns (uint) {
        return ticketCost;
    }
}
