const Web3 = require("web3");
const Tx = require("ethereumjs-tx").Transaction;
const { mainContractABI } = require("./constants/ABI/main-contract");
const { storageContractABI } = require("./constants/ABI/storage-contract");
const {
  MAIN_CONTRACT_ROOTSTOCK_MAINNET,
  STORAGE_CONTRACT_ROOTSTOCK_MAINNET,
  CHAIN_ID_ROOTSTOCK_MAINNET,
  MAIN_CONTRACT_ROOTSTOCK_TESTNET,
  STORAGE_CONTRACT_ROOTSTOCK_TESTNET,
  CHAIN_ID_ROOTSTOCK_TESTNET,
} = require("./config");

const errorMessage = require("./constants/errors");

let web3;

//  Get the contract addresses for the current Ethereum network
async function getContractAddress(env) {
  if (env === "testnet") {
    return {
      main: MAIN_CONTRACT_ROOTSTOCK_TESTNET,
      storage: STORAGE_CONTRACT_ROOTSTOCK_TESTNET,
      chainId: CHAIN_ID_ROOTSTOCK_TESTNET,
    };
  }
  if (env === "mainnet") {
    return {
      main: MAIN_CONTRACT_ROOTSTOCK_MAINNET,
      storage: STORAGE_CONTRACT_ROOTSTOCK_MAINNET,
      chainId: CHAIN_ID_ROOTSTOCK_MAINNET,
    };
  }

  return { error: errorMessage.INVALID_ENV_INPUT };
}

// POST method reusable code
async function sendTransaction(payload) {
  try {
    const { encodedABI, gas, from, to, privateKey, value, env } = payload;

    const gasPrice = await web3.eth.getGasPrice();
    const count = await web3.eth.getTransactionCount(from);
    const nonce = await web3.utils.toHex(count);
    const { chainId: CHAIN_ID, error } = await getContractAddress(env);

    const rawTx = {
      to,
      data: encodedABI,
      gas,
      value,
      from,
      chainId: CHAIN_ID,
    };

    const signedTx = await web3.eth.accounts.signTransaction(rawTx, privateKey);

    let response;
    try {
      response = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    } catch (error) {
      console.log(error, "Response");
    }

    return response;
  } catch (error) {
    return { error: [{ name: "address & safle id", message: error.message }] };
  }
}

//  Function to check Safle ID validity
async function isSafleIdValid(safleId) {
  const safleIdLength = safleId.length;

  if (
    safleIdLength >= 4 &&
    safleIdLength <= 16 &&
    safleId.match(/^[0-9a-z]+$/i) !== null
  ) {
    return true;
  }

  return false;
}

class SafleID {
  constructor(env, rpcUrl) {
    web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl));
    this.MainContractABI = mainContractABI;
    this.StorageContractABI = storageContractABI;
    this.env = env;
  }

  //  Get the status of Safle ID registration
  async isRegistrationPaused() {
    const { main: MAIN_CONTRACT_ADDRESS, error } = await getContractAddress(
      this.env
    );

    if (error) {
      return { error };
    }

    const MainContract = new web3.eth.Contract(
      this.MainContractABI,
      MAIN_CONTRACT_ADDRESS
    );

    const isRegistrationPaused = await MainContract.methods
      .safleIdRegStatus()
      .call();

    return isRegistrationPaused;
  }

  //  Get the number of times the user updated their Safle ID
  async getUpdateCount(address) {
    try {
      const { storage: STORAGE_CONTRACT_ADDRESS, error } =
        await getContractAddress(this.env);

      if (error) {
        return { error };
      }

      const StorageContract = new web3.eth.Contract(
        this.StorageContractABI,
        STORAGE_CONTRACT_ADDRESS
      );

      const updateCount = await StorageContract.methods
        .totalSafleIDCount(address)
        .call();

      return updateCount;
    } catch (error) {
      return errorMessage.INVALID_ADDRESS;
    }
  }

  //  Get the Safle ID from address
  async getSafleId(userAddress) {
    try {
      const { storage: STORAGE_CONTRACT_ADDRESS, error } =
        await getContractAddress(this.env);

      if (error) {
        return { error };
      }

      const StorageContract = new web3.eth.Contract(
        this.StorageContractABI,
        STORAGE_CONTRACT_ADDRESS
      );

      const userSafleID = await StorageContract.methods
        .resolveUserAddress(userAddress)
        .call();

      if (userSafleID != "") {
        return userSafleID;
      } else {
        return "Invalid address.";
      }
    } catch (error) {
      return errorMessage.INVALID_ADDRESS;
    }
  }

  //  Resolve the user's address from their Safle ID
  async getAddress(safleID) {
    try {
      const { storage: STORAGE_CONTRACT_ADDRESS, error } =
        await getContractAddress(this.env);

      const StorageContract = new web3.eth.Contract(
        this.StorageContractABI,
        STORAGE_CONTRACT_ADDRESS
      );
      let userAddress;
      try {
        userAddress = await StorageContract.methods
          .resolveSafleId(safleID)
          .call();

        return userAddress;
      } catch (error) {
        return "0x0000000000000000000000000000000000000000";
      }
    } catch (error) {
      return errorMessage.SAFLE_ID_NOT_REGISTERED;
    }
  }

  //  Get the Safle ID registration fees
  async safleIdFees() {
    const { main: MAIN_CONTRACT_ADDRESS, error } = await getContractAddress(
      this.env
    );

    if (error) {
      return { error };
    }

    const MainContract = new web3.eth.Contract(
      this.MainContractABI,
      MAIN_CONTRACT_ADDRESS
    );

    const safleIdFees = await MainContract.methods.safleIdFees().call();

    return safleIdFees;
  }

  //  Resolve old safleIds
  async resolveOldSafleId(address, index) {
    const { storage: STORAGE_CONTRACT_ADDRESS, error } =
      await getContractAddress(this.env);

    if (error) {
      return { error };
    }

    const StorageContract = new web3.eth.Contract(
      this.StorageContractABI,
      STORAGE_CONTRACT_ADDRESS
    );

    try {
      const oldSafleId = await StorageContract.methods
        .resolveOldSafleIdFromAddress(address, index)
        .call();

      const safleId = web3.utils.hexToUtf8(oldSafleId);

      return safleId;
    } catch (err) {
      return errorMessage.NO_SAFLEID;
    }
  }

  // resolve safleId from coinAddress
  async coinAddressToSafleId(coinAddress) {
    const { storage: STORAGE_CONTRACT_ADDRESS, error } =
      await getContractAddress(this.env);

    if (error) {
      return { error };
    }

    const StorageContract = new web3.eth.Contract(
      this.StorageContractABI,
      STORAGE_CONTRACT_ADDRESS
    );

    const safleId = await StorageContract.methods
      .coinAddressToId(coinAddress)
      .call();

    if (safleId !== "") {
      return safleId;
    }

    return errorMessage.COIN_ADDRESS_NOT_REGISTERED;
  }

  // resolve coinAddress from safleId and chainId
  async safleIdToCoinAddress(safleId, chainId) {
    const { storage: STORAGE_CONTRACT_ADDRESS, error } =
      await getContractAddress(this.env);

    if (error) {
      return { error };
    }

    const StorageContract = new web3.eth.Contract(
      this.StorageContractABI,
      STORAGE_CONTRACT_ADDRESS
    );

    const coinAddress = await StorageContract.methods
      .idToCoinAddress(safleId, chainId + 1)
      .call();

    if (coinAddress !== "") {
      return coinAddress;
    }

    return errorMessage.NO_COIN_ADDRESS;
  }

  //  Register a new user with Safle ID
  async setSafleId(payload) {
    const { userAddress, safleId, from, privateKey } = payload;

    const isSafleIDRegOnHold = await this.isRegistrationPaused();

    if (isSafleIDRegOnHold) {
      return errorMessage.SAFLEID_REG_ON_HOLD;
    }

    const isAddressTaken = await this.getSafleId(userAddress);

    if (isAddressTaken !== "Invalid address.") {
      return errorMessage.ADDRESS_ALREADY_TAKEN;
    }

    const addressOfSafleId = await this.getAddress(safleId);

    if (addressOfSafleId !== "0x0000000000000000000000000000000000000000") {
      return errorMessage.SAFLEID_ALREADY_TAKEN;
    }

    const fees = await this.safleIdFees();
    const isSafleIDValid = await isSafleIdValid(safleId);

    if (isSafleIDValid === false) {
      return errorMessage.INVALID_SAFLEID;
    }

    try {
      const { main: MAIN_CONTRACT_ADDRESS, error } = await getContractAddress(
        this.env
      );

      if (error) {
        return { error };
      }

      const MainContract = new web3.eth.Contract(
        this.MainContractABI,
        MAIN_CONTRACT_ADDRESS
      );

      const encodedABI = await MainContract.methods
        .registerSafleId(userAddress, safleId)
        .encodeABI();
      // const gas = 4000000;
      const gas = await MainContract.methods
        .registerSafleId(userAddress, safleId)
        .estimateGas({
          from: from,
          value: fees,
        });

      const response = await sendTransaction({
        encodedABI,
        gas,
        from,
        to: MAIN_CONTRACT_ADDRESS,
        privateKey,
        value: fees,
        env: this.env,
      });

      return response;
    } catch (error) {
      return error;
    }
  }

  //  Update Safle ID of the user
  async updateSafleId(payload) {
    const { userAddress, newSafleId, from, privateKey } = payload;

    const isSafleIdRegOnHold = await this.isRegistrationPaused();

    if (isSafleIdRegOnHold) {
      return errorMessage.SAFLEID_REG_ON_HOLD;
    }

    const addressOfSafleId = await this.getAddress(newSafleId);

    if (addressOfSafleId !== "0x0000000000000000000000000000000000000000") {
      return errorMessage.SAFLEID_ALREADY_TAKEN;
    }

    const updateCount = await this.getUpdateCount(userAddress);
    const fees = await this.safleIdFees();
    const isSafleIDValid = await isSafleIdValid(newSafleId);

    if (updateCount >= 2) {
      return errorMessage.SAFLEID_MAX_COUNT;
    }
    if (isSafleIDValid === false) {
      return errorMessage.INVALID_SAFLEID;
    }

    try {
      const { main: MAIN_CONTRACT_ADDRESS, error } = await getContractAddress(
        this.env
      );

      if (error) {
        return { error };
      }

      const MainContract = new web3.eth.Contract(
        this.MainContractABI,
        MAIN_CONTRACT_ADDRESS
      );

      const encodedABI = await MainContract.methods
        .updateSafleId(userAddress, newSafleId)
        .encodeABI();
      const gas = await MainContract.methods
        .updateSafleId(userAddress, newSafleId)
        .estimateGas({
          from: from,
          value: fees,
        });

      const response = await sendTransaction({
        encodedABI,
        gas,
        from,
        to: MAIN_CONTRACT_ADDRESS,
        privateKey,
        value: fees,
        env: this.env,
      });

      return response;
    } catch (error) {
      return errorMessage.INVALID_INPUT;
    }
  }
}

module.exports = { SafleID };
