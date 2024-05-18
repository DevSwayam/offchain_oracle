import React, { useState } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import './App.css';

const SendMessage = () => {
    const [ciphertext, setCiphertext] = useState('');
    const [status, setStatus] = useState('');

    const sendMessage = async () => {
        if (!window.ethereum) {
            alert('MetaMask is not installed');
            return;
        }

        try {
            // Request account access if needed
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            // Create a provider and signer
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();

            // Define the contract ABI
            const abi = [
                {
                    "inputs": [
                        {
                            "internalType": "bytes32",
                            "name": "_hash",
                            "type": "bytes32"
                        }
                    ],
                    "name": "sendmEssage",
                    "outputs": [],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }
            ];

            // Replace with your contract address
            const contractAddress = "0x9e3BAF1809dbf8D202A27f70DDb458862fC1fAd5";

            // Create a contract instance
            const contract = new ethers.Contract(contractAddress, abi, signer);

            // Convert the ciphertext to a keccak256 hash
            const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(ciphertext));

            // Call the contract function
            const tx = await contract.sendmEssage(hash);
            setStatus(`Transaction submitted: ${tx.hash}`);
            await tx.wait();
            setStatus(`Transaction mined: ${tx.hash}`);

            // Make a server call with the hash, ciphertext, and user address
            const userAddress = await signer.getAddress(); // Get the user address
            const requestBody = {
                hash: hash,
                ciphertext: ciphertext,
                userAddress: userAddress
            };

            const response = await axios.post('http://localhost:8080/api/sendMessage', requestBody);
            console.log('Server response:', response.data);
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('Error sending message');
        }
    }

    return (
        <div className="container">
            <h1>Send Ciphertext to Contract</h1>
            <a href='https://utils.inco.org/' target='_blank' className='underline'>Get Your Euint8 Ciphertext </a>
            <input 
                type="text" 
                value={ciphertext} 
                onChange={(e) => setCiphertext(e.target.value)} 
                placeholder="Enter your ciphertext" 
            />
            <button onClick={sendMessage}>Send Ciphertext</button>
            <p>{status}</p>
        </div>
    );
}

export default SendMessage;
