# eth-shop

## **Ethereum smart contract shop (React + Node + Express + [Ganache](https://github.com/trufflesuite/ganache-cli))**

![Example](https://media.giphy.com/media/dTzHBqzWFrTcL9C1xD/giphy.gif)

Project is purely for demonstration purposes.
### Installation
```
$ yarn global add ganache-cli
$ git clone https://github.com/MingaudasVagonis/eth-shop.git
```

### Launch

- First launch
```
$ cd eth-shop
$ sh eth_shop.sh initial
```

- Other launches
```
$ sh eth_shop.sh
```

## Business model

Customer places an order, the seller sends the price, when the customer agrees with the price, the contract is signed but funds are withdrawn after the customer and the courier confirms that the order is delivered.
