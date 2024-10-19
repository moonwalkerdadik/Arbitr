// client/src/services/blockchain.js
import Web3 from 'web3';
import Arbitration from './contracts/Arbitration.json';

const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");

export const getContract = async () => {
  const networkId = await web3.eth.net.getId();
  const deployedNetwork = Arbitration.networks[networkId];
  return new web3.eth.Contract(
    Arbitration.abi,
    deployedNetwork && deployedNetwork.address
  );
};

import React, { useEffect, useState } from 'react';
import { getContract } from './services/blockchain';

const App = () => {
  const [deals, setDeals] = useState([]);

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

  return (
    <div>
      <h1>Arbitration Platform</h1>
      {deals.map((deal, index) => (
        <div key={index}>
          <p>Deal {index}: {deal.buyer} -> {deal.seller} ({deal.amount} wei)</p>
        </div>
      ))}
    </div>
  );
};

export default App;
