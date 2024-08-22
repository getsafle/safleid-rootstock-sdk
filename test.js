const Web3 = require("web3");
const { mainContractABI } = require("./src/constants/ABI/main-contract");
const { storageContractABI } = require("./src/constants/ABI/storage-contract");
const { SafleID } = require("./src/index");
const {
  MAIN_CONTRACT_ROOTSTOCK_TESTNET,
  STORAGE_CONTRACT_ROOTSTOCK_TESTNET,
  CHAIN_ID_ROOTSTOCK_TESTNET,
} = require("./src/config/index");

describe("RegistrarMain Contract", () => {
  let web3;
  let mainContract;
  let storageContract;
  let owner;
  let user;
  let user1;
  let registrarFees = 0;
  let registrarName;
  let privateKey =
    "0dd5d81a809ec95e812614d3056c88ec130bbb76f5a4b2327f79a435c321be4c"; // Owner's private key
  beforeAll(async () => {
    web3 = new Web3(
      "https://rpc.testnet.rootstock.io/FhQhYq1qYdhhMQiTiGNZ2vSdxfbGY7-T"
    );
    safleID = new SafleID(
      "testnet",
      "https://rpc.testnet.rootstock.io/FhQhYq1qYdhhMQiTiGNZ2vSdxfbGY7-T"
    );

    // Get the contract instances
    mainContract = new web3.eth.Contract(
      mainContractABI,
      MAIN_CONTRACT_ROOTSTOCK_TESTNET
    );
    storageContract = new web3.eth.Contract(
      storageContractABI,
      STORAGE_CONTRACT_ROOTSTOCK_TESTNET
    );
    owner = "0x70C1c4FDeB25aB45a1efa2500978F1A905EbBB85"; // Owner is registered as registrar for the deployed testnet contract
    user = "0x15a377087494C63aD58dA0e78510Acbe003c6D13";
    user1 = "0x39a12270a22082169945dCD059BEA67D6A6Ed874";

    registrarName = "myregistrar";
  });

  /**
   * Uncomment the below register and update safle Id tests with new user addresse's and safle Ids for them to succeed
   */
  test("Register Safle ID", async () => {
    // Register a new Safle ID
    // const safleId = "husiennew123";
    // const response = await safleID.setSafleId({
    //   userAddress: user,
    //   safleId,
    //   from: owner,
    //   privateKey,
    // });
    // console.log(response);
    // const userSafleId = await storageContract.methods
    //   .resolveUserAddress(user)
    //   .call();
    // console.log(userSafleId);
    // expect(userSafleId).toBe(safleId);
    // expect(response).not.toHaveProperty("error");
  });

  test("update Safle ID", async () => {
    // const newSafleId = "voranew123";
    // const response = await safleID.updateSafleId({
    //   userAddress: user,
    //   newSafleId,
    //   from: owner,
    //   privateKey,
    // });
    // console.log(response);
    // const userSafleId = await storageContract.methods
    //   .resolveUserAddress(user)
    //   .call();
    // console.log(userSafleId);
    // expect(userSafleId).toBe(newSafleId);
  });

  test("Check if registration is paused", async () => {
    const isRegistrationPaused = await safleID.isRegistrationPaused();
    expect(typeof isRegistrationPaused).toBe("boolean");
  });

  test("Get update count", async () => {
    const updateCount = await safleID.getUpdateCount(user);
    console.log(updateCount);
    expect(typeof updateCount).toBe("string");

    expect(parseInt(updateCount)).toBeGreaterThanOrEqual(0);
  });

  test("Get Safle ID from address", async () => {
    const safleId = await safleID.getSafleId(user);
    console.log(safleId);
    expect(typeof safleId).toBe("string");
    expect(safleId).not.toBe("Invalid address.");
  });

  test("Get address from Safle ID", async () => {
    const safleId = "voranew123"; // Use a known Safle ID
    const address = await safleID.getAddress(safleId);
    console.log(address);
    expect(address).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
  test("Get Safle ID registration fees", async () => {
    const fees = await safleID.safleIdFees();
    console.log(fees);
    expect(typeof fees).toBe("string");
    expect(parseInt(fees)).toBeGreaterThanOrEqual(0);
  });

  test("Resolve old Safle ID", async () => {
    const oldSafleId = await safleID.resolveOldSafleId(user, 0);
    console.log(oldSafleId);
    expect(typeof oldSafleId).toBe("string");
  });
});
