// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;


import { ILottery } from './ILottery.sol';


contract Lottery is ILottery {

    string name;
    uint ticketCost;
    address manager;
    struct Player {
        string name;
        address payable wallet;
        uint index;
    }
    mapping (address => Player) players;
    address[] playerList;
    Status currentStatus;
    Player winner;

    event NewPlayer(string playerName);
    event LotteryFinished(address winner);

    enum Status { inactive, prepared, active, finished }

    constructor(string memory _name, address _manager) {
        name = _name;
        manager = _manager;
    }

    modifier onlyManager() {
        require(manager == msg.sender);
        _;
    }

    function getName() override public view returns (string memory) {
        return name;
    }

    function activate(uint _ticketCost) override public onlyManager {
        require(currentStatus == Status.inactive);
        ticketCost = _ticketCost;
        currentStatus = Status.prepared;
    }

    function getTicketCost() override public view returns (uint) {
        return ticketCost;
    }

    function buyTicket(string memory _name) override public payable {
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
        emit NewPlayer(_name);  // TODO: test event
    }

    function getMyInfo() public view returns (string memory, address, uint) {
        return _getPlayerInfo(msg.sender);
    }

    function getPlayerInfo(address playerAddress) public view onlyManager returns (string memory, address, uint)  {
        return _getPlayerInfo(playerAddress);
    }

    function _getPlayerInfo(address playerAddress) private view returns (string memory, address, uint) {
        Player storage player = players[playerAddress];
        return (player.name, player.wallet, player.index);
    }

    receive() external payable {
        buyTicket('unknown');
    }

    function generateRandomNumber() private view returns (uint) {
        // TODO: not recommended for production
        return uint(keccak256(abi.encodePacked(
            block.timestamp,
            block.difficulty,
            msg.sender
        )));
    }

    function pickWinner() override external onlyManager {
        uint winnerIndex = generateRandomNumber() % playerList.length;
        winner = players[playerList[winnerIndex]];
        winner.wallet.transfer(address(this).balance);  // TODO: test transfer
        currentStatus = Status.finished;
        emit LotteryFinished(winner.wallet);  // TODO: test event
    }
}
