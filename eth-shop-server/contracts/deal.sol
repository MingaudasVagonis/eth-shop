pragma solidity ^0.4.22;
contract Deal {

  address public owner;

  address public buyerAddr;

  struct Buyer {
    address addr;
    string name;
    bool init;
  }

  struct Shipment {
    address courier;
    uint price;
    uint safepay;
    address payer;
    uint date;
    uint real_date;
    bool init;
  }

  struct Order {
    string goods;
    uint number;
    uint price;
    uint safepay;
    Shipment shipment;
    bool init;
  }

  struct Invoice {
    uint orderno;
    uint number;

    bool init;
  }

  mapping (uint => Order) orders;

  mapping (uint => Invoice) invoices;

  uint orderseq;

  uint invoiceseq;

  event BuyerRegistered(address buyer, string name);

  event OrderSent(address buyer, string goods, uint orderno);

  event PriceSent(address buyer, uint orderno, uint price, int8 ttype);

  event SafepaySent(address buyer, uint orderno, uint value, uint now);

  event InvoiceSent(address buyer, uint invoiceno, uint orderno, uint delivery_date, address courier);

  event OrderDelivered(address buyer, uint invoiceno, uint orderno, uint real_delivey_date, address courier);

  constructor(address _buyerAddr) public payable {

    owner = msg.sender;
    buyerAddr = _buyerAddr;

  }

  function sendOrder(string goods) payable public {
    
    require(msg.sender == buyerAddr);

    orderseq++;

    orders[orderseq] = Order(goods, orderseq, 0, 0, Shipment(0, 0, 0, 0, 0, 0, false), true);

    emit OrderSent(msg.sender, goods, orderseq);

  }

  function queryOrder(uint number) constant public returns (address buyer, string goods, uint price, uint safepay, uint delivery_price, uint delivey_safepay) {
    
    require(orders[number].init);

    return(buyerAddr, orders[number].goods, orders[number].price, orders[number].safepay, orders[number].shipment.price, orders[number].shipment.safepay);
  }

  function sendPrice(uint orderno, uint price, int8 ttype) payable public {
  
    require(msg.sender == owner);

    require(orders[orderno].init);

    require(ttype == 1 || ttype == 2);

    if(ttype == 1){

      orders[orderno].price = price;

    } else {

      orders[orderno].shipment.price = price;
      orders[orderno].shipment.init  = true;
    }

    emit PriceSent(buyerAddr, orderno, price, ttype);

  }

  function sendSafepay(uint orderno) payable public {

    require(orders[orderno].init);

    require(buyerAddr == msg.sender);

    require((orders[orderno].price + orders[orderno].shipment.price) == msg.value);

    orders[orderno].safepay = msg.value;

    emit SafepaySent(msg.sender, orderno, msg.value, now)
  }

  function sendInvoice(uint orderno, uint delivery_date, address courier) payable public {

    require(orders[orderno].init);

    require(owner == msg.sender);

    invoiceseq++;

    invoices[invoiceseq] = Invoice(orderno, invoiceseq, true);

    orders[orderno].shipment.date    = delivery_date;
    orders[orderno].shipment.courier = courier;

    emit InvoiceSent(buyerAddr, invoiceseq, orderno, delivery_date, courier);
  }

  function getInvoice(uint invoiceno) constant public returns (address buyer, uint orderno, uint delivery_date, address courier){
  
    require(invoices[invoiceno].init);

    Invoice storage _invoice = invoices[invoiceno];
    Order storage _order     = orders[_invoice.orderno];

    return (buyerAddr, _order.number, _order.shipment.date, _order.shipment.courier);
  }

  function delivery(uint invoiceno, uint timestamp) payable public {

    require(invoices[invoiceno].init);

    Invoice storage _invoice = invoices[invoiceno];
    Order storage _order     = orders[_invoice.orderno];

    require(_order.shipment.courier == msg.sender);

    emit OrderDelivered(buyerAddr, invoiceno, _order.number, timestamp, _order.shipment.courier);

    owner.transfer(_order.safepay);

    _order.shipment.courier.transfer(_order.shipment.safepay);

  }

  function health() pure public returns (string) {
    return "running";
  }
}