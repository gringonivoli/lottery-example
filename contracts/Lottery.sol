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
    address[] playerList;
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
        // TODO: me parece mas claro verificar el sender que el address(0), pero en 
        // terminos de performance/costos, todavia no se cual es mas conveniente.
        require(players[msg.sender].wallet != msg.sender, 'You are already playing');
        // require(players[msg.sender].wallet == address(0), 'You are already playing');
        Player storage player = players[msg.sender];
        playerList.push(msg.sender);
        player.name = _name;
        player.wallet = msg.sender;
        player.index = playerList.length;
        currentStatus = Status.active;  // TODO: esto se ejecuta siempre y no siempre es necesario... consume mas gas ???
    }

    function getMyInfo() public view returns (string memory, address, uint) {
        Player storage player = players[msg.sender];
        return (player.name, player.wallet, player.index);
    }

    receive() external payable {
        buyTicket('unknown');
    }
}
