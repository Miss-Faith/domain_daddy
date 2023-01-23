import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { ethers } from 'ethers'

// Components
import Navigation from '../components/Navigation'
import Search from '../components/Search'
import Domain from '../components/Domain'

// add bootstrap css 
import 'bootstrap/dist/css/bootstrap.css'

// Import abi
import abi from "../utils/DomainDaddy.json";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function App({ Component, pageProps }: AppProps) {
  const contractAddress = "0x236Da9a165aAc9388CEe9F830e039Bd9EC4b12f2";
  const contractABI = abi.abi;

  const [provider, setProvider] = useState("")
  const [account, setAccount] = useState("")

  const [dDaddy, setDomainDaddy] = useState("")
  const [domains, setDomains] = useState([])

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner();
    const network = await provider.getNetwork()
    const dDaddy = new ethers.Contract(
      contractAddress,
      contractABI,
      signer
    );

    const maxSupply = await dDaddy.maxSupply()
    const domains = []

    for (var i = 1; i <= maxSupply; i++) {
      const domain = await dDaddy.getDomain(i)
      domains.push(domain)
    }

    setDomains(domains)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  useEffect(() => {
    loadBlockchainData()
  }, [])
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />

      <Search />

      <div className='cards__section'>
        <h2 className='cards__title'>Why you need a domain name.</h2>
        <p className='cards__description'>
          Own your custom username, use it across services, and
          be able to store an avatar and other profile data.
        </p>

        <hr />

        <div className='cards'>
          {domains.map((domain, index) => (
            <Domain domain={domain} dDaddy={dDaddy} provider={provider} id={index + 1} key={index} />
          ))}
        </div>
      </div>
    </div>
  );
}