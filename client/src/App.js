// client/src/App.js
import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import { getContract } from './services/blockchain';

const App = () => {
  const [account, setAccount] = useState('');
  const [deals, setDeals] = useState([]);
  const [seller, setSeller] = useState('');
  const [amount, setAmount] = useState('');

  // Подключение к Web3
  useEffect(() => {
    async function load() {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      const accounts = await web3.eth.requestAccounts();
      setAccount(accounts[0]);
    }
    load();
  }, []);

  // Загрузка сделок
  useEffect(() => {
    const loadDeals = async () => {
      const contract = await getContract();
      const dealCount = await contract.methods.dealCount().call();
      let dealsArray = [];
      for (let i = 0; i < dealCount; i++) {
        const deal = await contract.methods.deals(i).call();
        dealsArray.push(deal);
      }
      setDeals(dealsArray);
    };
    loadDeals();
  }, []);

  // Создание сделки
  const createDeal = async () => {
    const contract = await getContract();
    await contract.methods.createDeal(seller).send({
      from: account,
      value: Web3.utils.toWei(amount, 'ether')
    });
  };

  return (
    <div>
      <h1>Arbitration Platform</h1>
      <p>Account: {account}</p>

      <h2>Create New Deal</h2>
      <input
        type="text"
        placeholder="Seller Address"
        value={seller}
        onChange={(e) => setSeller(e.target.value)}
      />
      <input
        type="text"
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={createDeal}>Create Deal</button>

      <h2>Existing Deals</h2>
      {deals.map((deal, index) => (
        <div key={index}>
          <p>
            Deal {index + 1}: Buyer: {deal.buyer}, Seller: {deal.seller}, Amount: {Web3.utils.fromWei(deal.amount, 'ether')} ETH
          </p>
        </div>
      ))}
    </div>
  );
};

export default App;
