import React, { useEffect } from 'react';
import logo from './logo.svg';
import { useQuery, gql, useLazyQuery } from '@apollo/client';
import './App.css';
import web3 from "web3";
import { Header } from './pages/Grid/Header/Header';
import { HeaderContainer } from './pages/Grid/Header/HeaderContainer';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Button, Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { arbitrum, mainnet, polygon } from 'wagmi/chains'
import { walletService } from './services/wallet.service';


const GET_LOCATIONS = gql`
  query {
    hello(value:"2") 
  }
`;

const chains = [arbitrum, mainnet, polygon]
const projectId = '0f3ace6ddfe89cfd29f110035b3f54f3'

const { provider } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)


function App() {
  const [runQuery, { loading, error, data }] = useLazyQuery(GET_LOCATIONS);

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      walletService.disconnectWalletConnect()
    });
  }, [])

  return (
    <>
      <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
      {/* <WagmiConfig client={wagmiClient}> */}
      <HeaderContainer />
      {/* </WagmiConfig> */}
    </>
  );
}

export default App;
