import { ethers } from "ethers";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { blockchainConfig } from "../config/blockchain-config";
import erc20ABI from "../contracts/erc20ABI.json"
import paymentRecieverAbi from "../contracts/paymentDepositABI.json"
import Web3 from "web3"

const { ethereum } = window;
let provider
if(ethereum){
    provider = new ethers.providers.Web3Provider(window.ethereum);
}

if(ethereum){
    window.ethereum.on('accountsChanged', async function (accounts) {
        // Time to reload your interface with accounts[0]!
        await connectWallet();
        window.location.reload()
      })
}


export const connectWallet = async () => {
    try {
        if (!ethereum) {
            toast.error("Please install metamask")
            return null;
        }
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts'
        });
        let balance = await provider.getBalance(accounts[0]);
        let bal = ethers.utils.formatEther(balance);
        localStorage.setItem("account", accounts[0]);
        localStorage.setItem("balance", bal)

        return true
    } catch (error) {
        console.log(error);
        return false
    }
}

export const getBalanceForNative = async() =>{
    try {
        if (!ethereum) {
            return 0
        }
        const accounts = await ethereum.request({
            method: 'eth_requestAccounts',
        });
        let balance = await provider.getBalance(accounts[0]);
        let bal = ethers.utils.formatEther(balance);
        localStorage.setItem("balance", parseFloat(bal).toFixed(4))

        if(bal > 0){
            return parseFloat(bal).toFixed(3)
        }

        return 0
    } catch (error) {
        return 0
    }
}

export const getBalanceOfErc20TOken = async (user, address) => {
    try {
        if (!ethereum) {
            return 0
        }
        const signer = provider.getSigner();

        //intitialise erc20Contracts
        const erc20Contract = new ethers.Contract(address, erc20ABI, signer)

        const getBalance = await erc20Contract.balanceOf(user);

        if (getBalance) {
            return getBalance
        }

        return 0
    } catch (error) {
        console.log(error);
        return 0
    }
}

export const getApprovalForErc20 = async (amount, spender, user, address) => {
    try {
        const signer = provider.getSigner();

        //intitialise erc20Contracts
        const erc20Contract = new ethers.Contract(address, erc20ABI, signer)

        const checkAllowance = await erc20Contract.allowance(user, spender);

        if (checkAllowance && checkAllowance > amount) {
            return true
        }

        const approve = await erc20Contract.approve(spender, amount)
        if (approve) {
            await approve.wait()

            return true
        }

        return false
    } catch (error) {
        console.log(error);
        return false
    }
}

export const getTotalDepositedAmount = async (user, token) => {
    try {
        const signer = provider.getSigner();

        //initialise paymentReciever
        const paymentReciever = new ethers.Contract(blockchainConfig.paymentReciever, paymentRecieverAbi, signer);

        const depsAmt = await paymentReciever._netDeposited(user, token);
        if (depsAmt) {
            return depsAmt
        }
        return 0
    } catch (error) {
        return 0
    }
}

export const getDepositionEventsForUser = async (user) => {
    try {
        const web3 = new Web3(new Web3.providers.HttpProvider(blockchainConfig.rpc_url));

        const paymentContract = new web3.eth.Contract(paymentRecieverAbi, blockchainConfig.paymentReciever);

        const getPastEvents = await paymentContract.getPastEvents("PaymentRecieved", {
            filter: { from: user },
            fromBlock: 0,
            toBlock: 'latest'
        })

        return getPastEvents
    } catch (error) {
        console.log(
            error
        );
        return []
    }

}
export const getDepositionEvents = async () => {
    try {
        const web3 = new Web3(new Web3.providers.HttpProvider(blockchainConfig.rpc_url));

        const paymentContract = new web3.eth.Contract(paymentRecieverAbi, blockchainConfig.paymentReciever);

        const getPastEvents = await paymentContract.getPastEvents("PaymentRecieved", {
            fromBlock: 0,
            toBlock: 'latest'
        })

        return getPastEvents
    } catch (error) {
        console.log(
            error
        );
        return []
    }

}

export const depositFunds = async(user, erc20Token, amount) =>{
    try {
        const signer = provider.getSigner();

        //initialise paymentReciever
        const paymentReciever = new ethers.Contract(blockchainConfig.paymentReciever, paymentRecieverAbi, signer);
        
        const depositFund = await paymentReciever.deposit(amount, erc20Token,{value : amount});

        if(depositFund){
            await depositFund.wait()
            return depositFund
        }
        return false
    } catch (error) {
        throw new Error(error)
    }
}

export const CheckIfAdminLogin = async() =>{
    try {
        const signer = provider.getSigner();

        //initialise paymentReciever
        const paymentReciever = new ethers.Contract(blockchainConfig.paymentReciever, paymentRecieverAbi, signer);

        const collector = await paymentReciever.Collector();

        const accounts = await ethereum.request({
            method: 'eth_requestAccounts',
        });

        if(accounts[0].toLowerCase() === collector.toLowerCase()){
            return true
        }
        return false
    } catch (error) {
        return false
    }
}
