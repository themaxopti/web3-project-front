import Web3 from "web3";
import WalletConnect from "@walletconnect/client";
import { convertUtf8ToHex } from "@walletconnect/utils";
import QRCodeModal from "@walletconnect/qrcode-modal";

// import {
//   Mainnet,
//   DAppProvider,
//   useEtherBalance,
//   useEthers,
//   Config,
//   Goerli,
// } from "@usedapp/core";
// import { formatEther } from "@ethersproject/units";

class WalletService {
  public isMetaMaskInstalled() {
    return Boolean(window.ethereum && window.ethereum.isMetaMask);
  }

  async connectMetaMask() {
    const accounts = await this.initialise();
    if (accounts) {
      localStorage.setItem("userAcc", accounts[0]);
      console.log(accounts);
      return accounts;
    }
    if (window.ethereum) {
      await window.ethereum?.request({ method: "eth_requestAccounts" });
      window.web3 = new Web3(window.ethereum);
      return true;
    }
    return false;
  }

  async disconnectWalletConnect() {
    localStorage.removeItem("wagmi.connected");
    localStorage.removeItem("wagmi.store");
    localStorage.removeItem("wagmi.wallet");
    localStorage.removeItem("W3M_VERSION");
    localStorage.removeItem("walletconnect");
    // document.cookie = "_ga" + "=; Max-Age=-99999999;";
    // document.cookie = "_ga_5JMT7FHJKL" + "=; Max-Age=-99999999;";
  }

  async connectWalletConnect(open: any) {
    const res = await open();
    console.log(res);

    const { ethereum } = window;
    const accounts = await ethereum?.request({ method: "eth_accounts" });
    if (accounts) {
      localStorage.setItem("userAcc", accounts[0]);
      console.log(accounts);
      return accounts;
    }
    return false;
  }

  async isMetaMaskConnected() {
    const { ethereum } = window;
    const accounts = await ethereum?.request({ method: "eth_accounts" });
    if (accounts && accounts.length > 0) {
      return accounts;
    }
    return false;
  }

  async getSignature(getNonce: any, verifyAccount: any, accounts: any[]) {
    const res = await getNonce({
      variables: {
        address: accounts[0],
      },
    });

    let signature = await window.ethereum.request({
      method: "personal_sign",
      params: [res.data.nonce.message, accounts[0]],
    });

    let data;
    if (signature) {
      data = await verifyAccount({
        variables: {
          signature,
        },
        context: {
          headers: {
            Authorization: `Bearer ${res.data.nonce.tempToken}`,
          },
        },
      });
      localStorage.setItem("userToken", data.data.verify);
    }

    return { signature, response: res, data };
  }

  async walletConnectSignature(
    address: string,
    getNonce: any,
    verifyAccount: any
  ): Promise<any> {
    const connector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // Required
      qrcodeModal: QRCodeModal,
    });

    const response = await getNonce({
      variables: {
        address: address,
      },
    });
    const msgParams = [convertUtf8ToHex(response.data.nonce.message), address];

    //@ts-ignore
    const signature = await connector.signPersonalMessage(msgParams);
    console.log(signature);

    let data;
    if (signature) {
      data = await verifyAccount({
        variables: {
          signature,
        },
        context: {
          headers: {
            Authorization: `Bearer ${response.data.nonce.tempToken}`,
          },
        },
      });
      localStorage.setItem("userToken", data.data.verify);
    }
  }

  public async initialise() {
    const accounts = await this.isMetaMaskConnected();
    const installed = this.isMetaMaskInstalled();

    if (!installed) {
      throw new Error("Metamask is not installed");
    }
    if (!accounts) {
      return false;
    }

    return accounts;
  }
}

export const walletService = new WalletService();
