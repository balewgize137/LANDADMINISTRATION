import { ethers } from 'ethers';
import LandRegistryArtifact from '../contracts/LandRegistry.json';

// This address will be updated after you deploy your contract
const contractAddress = "0x6cE36e1209aAE832a2599710D70466a331e8BE7d";
const contractABI = LandRegistryArtifact.abi;
let contract;
let signer;

export const connectWalletAndContract = async () => {
    if (!window.ethereum) {
        alert("Please install MetaMask.");
        throw new Error("No crypto wallet found.");
    }
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        return { signer, contract };
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw new Error("Wallet connection failed.");
    }
};