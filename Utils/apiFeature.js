import {ethers} from "ethers";
import Web3Modal from "web3modal";

import {
    ChatAppAddress,
    ChatAppABI,
    handleNetworkSwitch,
} from "../Context/constants";

export const checkIfWalletConnected = async () => {
    try {
        if (!window.ethereum) return console.log("Install MateMask");
        const network = await handleNetworkSwitch();
        const accounts = await window.ethereum.request({
            method: "eth_accounts",
        });

        const firstAccount = accounts[0];
        return firstAccount;
    } catch (error) {
        console.log(error);
    }
};

export const connectWallet = async () => {
    try {
        if (!window.ethereum) return console.log("Install MetaMask");
        const network = await handleNetworkSwitch();
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        const firstAccount = accounts[0];
        return firstAccount;
    } catch (error) {
        console.log(error);
    }
};

const fetchContract = (signerOrProvider) =>
    new ethers.Contract(ChatAppAddress, ChatAppABI, signerOrProvider);

export const connectWithContract = async () => {
    try {
        const web3modal = new Web3Modal();
        const connection = await web3modal.connect();
        const provider = new ethers.providers.Web3Provider(connection);
        const signer = provider.getSigner();
        const contract = fetchContract(signer);
        return contract;
    } catch (error) {
        console.log(error);
    }
};

export const convertTime = (time) => {
    console.log(time)
    const timeInSeconds = parseInt(time, 16)
    const timeInMiliseconds = timeInSeconds * 1000
    const currentTime = new Date(timeInMiliseconds)


    return (currentTime.getDate()) + "." +
        currentTime.getMonth() + " " +
        currentTime.toLocaleTimeString('en-US')
};
