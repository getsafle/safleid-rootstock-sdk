# Safle Identity Wallet

This package is used to interact with Safle smart contracts. Registered Registrars can use this package to set and update safleId for the user.

Anyone can use this for SafleId Resolution.

For now the registrar process is manual, if you want to become one, drop us an email or engage on our social media channels. We will be making it democratic and decentralized soon, it's already in the smart contracts [Hint: You can build on it by yourself too!].

## Clone the repository

> Clone

Clone the repo by running the command,

`git clone https://github.com/getsafle/safleid-rootstock-sdk.git`

Import the package into your project using,

`const { SafleID } = require("./src/index");`

> Initialising

Initialise the constructor using your rootstock RPC URL like this,

`const safleID = new SafleID(env, rpcUrl);`

- `env` - The network to perform the blockchain queries. (valid values - `mainnet` or `testnet`).
- `rpcUrl` - RPC URL for the specified network env.

### List of all functions

# Set SafleId

## `setSafleId()`

#### Inputs

`userAddress` - Address of the user.
`safleId` - SafleId to be set.
`from` - Address of the registrar.
`privateKey` - Private Key of the registrar.

### Sample function call

```
const response = await safleID.setSafleId({
  userAddress: userAddress,
  safleId,
  from: registrarAddress,
  privateKey, // registrar's private key
});
```

#### Output

Transaction details.

# Update SafleId

## `updateSafleId()`

#### Inputs

`userAddress` - Address of the user.
`newSafleId` - New SafleId to be set.
`from` - Address of the registrar.
`privateKey` - Private Key of the registrar.

### Sample function call

```
const response =  await safleID.updateSafleId({
   userAddress: userAddress,
   newSafleId,
   from: registrarAddress,
   privateKey, // registrar's private key
});
```

#### Output

Transaction details.

# Check if SafleId registration is paused,

## `isRegistrationPaused()`

#### Inputs

No inputs.

### Sample function call

```
const isRegistrationPaused = await safleID.isRegistrationPaused();
```

#### Output

If registration is paused - `true`
If registration is not paused - `false`

> SafleId update count

---

# `getUpdateCount()`

#### Input

`address` - Address of the user to check the SafleId update count.

### Sample function call

```
 const updateCount = await safleID.getUpdateCount(address);
```

#### Output

update count
If invalid or wrong address - `Invalid address.`

> Retrieve the SafleId of a particular address

---

# `getSafleId()`

#### Input

`userAddress` - Address of the user to get the SafleId.

### Sample function call

```
 const safleId = await safleID.getSafleId(userAddress);
```

#### Output

SafleId of the user
If invalid or wrong address - `Invalid address.`

# Retrieve the address of a particular SafleId

## `getAddress()`

#### Input

`safleId` - SafleId of the user to get the address.

```
  const address = await safleID.getAddress(safleId);
```

#### Output

Address of the user.

# Get the current SafleId registration fees

## `safleIdFees()`

#### Inputs

No inputs.

### Sample function call

```
 const fees = await safleID.safleIdFees();
```

#### Output

SafleId registration fees.

# Resolve old safleIds of a user

## `resolveOldSafleId()`

#### Input

`address` - Address of the user.
`index` - Index of the old SafleId.

### Sample function call

```
const oldSafleId = await safleID.resolveOldSafleId(address, index);
```

#### Output

Old safleId of the user at that index.
