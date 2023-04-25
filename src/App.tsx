import React, { useEffect } from 'react';
import logo from './logo.svg';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import './App.css';
import web3 from "web3";



const GET_LOCATIONS = gql`
  query {
    hello(value:"2") 
  }
`;

const ethEnabled = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    window.web3 = new web3(window.ethereum);
    return true;
  }
  return false;
}

function App() {
  const [runQuery, { loading, error, data }] = useLazyQuery(GET_LOCATIONS);
  useEffect(() => {
    // runQuery().then(data => console.log(data))
    ethEnabled()
  }, [])

  return (
    <div className="App">

    </div>
  );
}

export default App;
