const LotteryCreator = artifacts.require('LotteryCreator');
const Lottery = artifacts.require('Lottery');

contract('LotteryCreator', accounts => {

    it('should obtain getLotteriesQuantity', async () => {
       const instance = await LotteryCreator.deployed();

       const quantity = await instance.getLotteriesQuantity({ from: accounts[0] });

       assert.equal(quantity, 0, 'Wrong Quantity');
    });

    it('should increment quantity', async () => {
        const instance = await LotteryCreator.deployed();
        await instance.createLottery('SorteoONGBitcoin', { from: accounts[0] });

        const quantity = await instance.getLotteriesQuantity({ from: accounts[0] });

        assert.equal(quantity, 1, 'Wrong Quantity');
    });

    it('should obtain one lottery data', async () => {
        const lotteryName = 'SorteoONGBitcoin'
        const instance = await LotteryCreator.deployed();
        await instance.createLottery(lotteryName, { from: accounts[0] });

        const lotteryData = await instance.getLottery(lotteryName, { from: accounts[0] });

        assert.equal(lotteryData.name, lotteryName, 'Wrong Quantity');
        assert(lotteryData.timestamp > 0, 'Major to zero');
    });

    it('should deploy a new Lottery', async () => {
        const lotteryName = 'SorteoONGBitcoin'
        const instance = await LotteryCreator.deployed();
        await instance.createLottery(lotteryName, { from: accounts[0] });
        const lotteryData = await instance.getLottery(lotteryName, { from: accounts[0] });
        const lotteryAddress = lotteryData.lottery;
        const lotteryInstance = await Lottery.at(lotteryAddress);

        const name = await lotteryInstance.getName({ from: accounts[0] });

        assert.equal(lotteryName, name, 'Contract deployed with wrong name');
    });
});
