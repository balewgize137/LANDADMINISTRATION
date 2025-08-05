import { ethers } from 'ethers';
// Make sure you have copied the ABI file to admin/src/contracts/
import LandRegistryArtifact from '../contracts/LandRegistry.json';

// --- IMPORTANT ---
// Paste the same, most recent contract address here that you used for the client app.
const contractAddress = "0x917765687A67bc999E13D72243e9642ab9663b15";
const contractABI = LandRegistryArtifact.abi;

let contract;
let signer;

export const connectWalletAndContract = async () => {
    if (!window.ethereum) {
        // Use a more user-friendly notification if possible, e.g., a toast
        alert("Please install MetaMask to use the blockchain features.");
        throw new Error("No crypto wallet found.");
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // For admin dashboard, we might not need to request accounts immediately for read-only data
        // but it's good practice to have it ready.
        await provider.send("eth_requestAccounts", []); 
        signer = await provider.getSigner();
        contract = new ethers.Contract(contractAddress, contractABI, signer);
        return { signer, contract };
    } catch (error) {
        console.error("Failed to connect wallet:", error);
        throw new Error("Wallet connection failed. Is MetaMask unlocked?");
    }
};

export const getContract = () => {
    if (!contract) throw new Error("Contract not initialized. Please connect your wallet first.");
    return contract;
};