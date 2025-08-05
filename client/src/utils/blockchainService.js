import { ethers } from 'ethers';
import LandRegistryArtifact from '../contracts/LandRegistry.json';

// This address will be updated after you deploy your contract
const contractAddress = "0xb12F3B5aCb93CC6aE3d139809E559C2EDA30731d";
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