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
    // TODO: hay que hacer el caso en donde no deje comprar el ticket
    // pero antes de eso voy a intentar refactorizar el testing para
    // obtener el contrato creador de un solo lugar.
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });

    assert.ok(true);
  });

  it('should buy a ticket by send eth directly', async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    
    await lotteryInstance.sendTransaction({ from: accounts[1], value: ticketCost });

    assert.ok(true);
  });

  it('should get my info', async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });

    const myInfo = await lotteryInstance.getMyInfo({ from: accounts[1] })

    assert.equal('Maxi', myInfo[0])
    assert.equal(accounts[1], myInfo[1])
    assert.ok(0 < myInfo[2])
  });

  it('should get player info only for a manager', async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });

    const playerInfo = await lotteryInstance.getPlayerInfo(accounts[1], { from: accounts[0] })

    assert.equal('Maxi', playerInfo[0])
    assert.equal(accounts[1], playerInfo[1])
    assert.ok(0 < playerInfo[2])
  });

  it('should get player info fails', async () => {
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    let err = null

    try {
       await lotteryInstance.getPlayerInfo(accounts[1], { from: accounts[1] })
    } catch (error){
      err = error
    }

    assert.ok(err instanceof Error)
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

  it('should buy only one ticket', async () => {
    let err = null;
    const lotteryName = "SorteoONGBitcoin";
    const lotteryCreatorInstance = await LotteryCreator.deployed();
    await lotteryCreatorInstance.createLottery(lotteryName, { from: accounts[0] });
    const lotteryData = await lotteryCreatorInstance.getLottery(lotteryName, { from: accounts[0] });
    const lotteryAddress = lotteryData.lottery;
    const lotteryInstance = await Lottery.at(lotteryAddress);
    await lotteryInstance.activate(1000, { from: accounts[0] });
    const ticketCost = await lotteryInstance.getTicketCost();
    
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });

    try {
    await lotteryInstance.buyTicket('Maxi', { from: accounts[1], value: ticketCost });
    } catch (error) {
      err = error
    }

    assert.ok(err instanceof Error);
  });
});
