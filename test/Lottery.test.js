const Lottery = artifacts.require("Lottery");
const LotteryCreator = artifacts.require("LotteryCreator");

contract("Lottery", (accounts) => {
  const defaultName = "Sorteo";

  it("should be created", async () => {
    const instance = await Lottery.deployed();

    assert(instance);
  });

  it("should return Lottery name", async () => {
    const instance = await Lottery.deployed();

    const name = await instance.getName({ from: accounts[0] });

    assert.equal(name, defaultName, "Wrong Name");
  });

  it('should buy a ticket', async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });

    assert(true);
  });

  it("should obtain cost of ticket", async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);

    await lotteryInstance.activate(1000, { from: accounts[0] });

    const ticketCost = await lotteryInstance.getTicketCost();

    assert.equal(ticketCost, 1000, "Wrong ticket cost");
  });

  it("should allow activate only owners", async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    let err = null;

    try {
      await lotteryInstance.activate(5000, { from: accounts[1] });
    } catch (error) {
        err = error;
    }

    assert.ok(err instanceof Error);
  });
});
