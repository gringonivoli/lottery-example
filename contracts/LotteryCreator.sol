// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import { Lottery } from './Lottery.sol';
import { ILottery } from './ILottery.sol';

contract LotteryCreator {
    uint256 quantity = 0;
    struct LotteryData {
        string name;
        address manager;
        uint256 timestamp;
        ILottery lottery;
    }
    mapping(string => LotteryData) lotteries;

    function getLotteriesQuantity() public view returns (uint256) {
        return quantity;
    }

    function createLottery(string memory name) public {
        LotteryData storage data = lotteries[name];
        data.name = name;
        data.manager = msg.sender;
        data.timestamp = block.timestamp;
        data.lottery = new Lottery(name, msg.sender);
        quantity++;
    }

    function addLottery(ILottery lottery) external {  // TODO: add tests
        LotteryData storage data = lotteries[lottery.getName()];
        data.name = lottery.getName();
        data.manager = msg.sender;
        data.timestamp = block.timestamp;
        data.lottery = lottery;
        quantity++;
    }

    function getLottery(string memory name) public view returns (LotteryData memory) {
        return lotteries[name];
    }
}
