// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract Lottery {

    string name;
    uint ticketCost;
    address manager;
    struct Player {
        string name;
        address wallet;
        uint index;
    }
    mapping (address => Player) players;
    Player[] playerList;
    Status currentStatus;

    enum Status { inactive, prepared, active, finished }

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
        require(currentStatus == Status.inactive);
        ticketCost = _ticketCost;
        currentStatus = Status.prepared;
    }

    function getTicketCost() public view returns (uint) {
        return ticketCost;
    }

    function buyTicket(string memory _name) public payable {
        require(currentStatus == Status.prepared || currentStatus == Status.active);
        require(msg.value == ticketCost, 'Wrong Value');
        Player storage player = players[msg.sender];
        playerList.push(player);
        player.name = _name;
        player.wallet = msg.sender;
        player.index = playerList.length;
        currentStatus = Status.active;  // TODO: esto se ejecuta siempre y no siempre es necesario... consume mas gas ???
    }
}
