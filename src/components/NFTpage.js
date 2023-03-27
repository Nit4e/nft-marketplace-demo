import Navbar from "./Navbar";
import axie from "../tile.jpeg";
import { useLocation, useParams } from 'react-router-dom';
import MarketplaceJSON from "../Marketplace.json";
import axios from "axios";
import { useState } from "react";

export default function NFTPage (props) {

const [data, updateData] = useState({});
const [dataFetched, updateDataFetched] = useState(false);
const [message, updateMessage] = useState("");
const [currAddress, updateCurrAddress] = useState("0x");
const [newPrice, setNewPrice] = useState("");

async function getNFTData(tokenId) {
    const ethers = require("ethers");
    //After adding your Hardhat network to your metamask, this code will get providers and signers
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const addr = await signer.getAddress();
    //Pull the deployed contract instance
    let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer)
    //create an NFT Token
    const tokenURI = await contract.tokenURI(tokenId);
    const listedToken = await contract.getListedTokenForId(tokenId);
    let meta = await axios.get(tokenURI);
    meta = meta.data;
    console.log(listedToken);

    let item = {
        price: meta.price,
        tokenId: tokenId,
        seller: listedToken.seller,
        owner: listedToken.owner,
        image: meta.image,
        name: meta.name,
        description: meta.description,
    }
    console.log(item);
    updateData(item);
    updateDataFetched(true);
    console.log("address", addr)
    updateCurrAddress(addr);
}

async function buyNFT(tokenId) {
    try {
        const ethers = require("ethers");
        //After adding your Hardhat network to your metamask, this code will get providers and signers
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        //Pull the deployed contract instance
        let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
        const salePrice = ethers.utils.parseUnits(data.price, 'ether')
        updateMessage("Buying the NFT... Please Wait (Upto 5 mins)")
        //run the executeSale function
        let transaction = await contract.executeSale(tokenId, {value:salePrice});
        await transaction.wait();

        alert('You successfully bought the NFT!');
        updateMessage("");
    }
    catch(e) {
        alert("Upload Error"+e)
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    try {
      const ethers = require("ethers");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      let contract = new ethers.Contract(MarketplaceJSON.address, MarketplaceJSON.abi, signer);
      const newPriceInWei = ethers.utils.parseUnits(newPrice, "ether");
      await contract.updateListPrice(tokenId, newPriceInWei);
      setNewPrice("");
      alert("Price updated!");
      document.getElementById("editForm").style.display = "none";
      getNFTData(tokenId);
    } catch (e) {
      alert("Error updating price: " + e.message);
    }
  }

    const params = useParams();
    const tokenId = params.tokenId;
    if(!dataFetched)
        getNFTData(tokenId);
    

function openForm () {
    document.getElementById("editForm").style.display = "block";
    setNewPrice("");
}

async function etidPrice() {
    openForm();   
}

    return(
        <div style={{"min-height":"100vh"}}>
            <Navbar></Navbar>
            <div className="flex ml-20 mt-20">
                <img src={data.image} alt="" className="w-2/5" />
                <div className="text-xl ml-20 space-y-8 text-white shadow-2xl rounded-lg border-2 p-5">
                    <div>
                        Name: {data.name}
                    </div>
                    <div>
                        Description: {data.description}
                    </div>
                    <div>
                        Price: 
                        { data.price == 0 ? 
                            <span className=""> None </span>
                            : <span className=""> {data.price + " ETH"} </span>
                        }
                    </div>
                    <div>
                    { currAddress == data.seller || currAddress == data.owner ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700
                        text-white font-bold py-2 px-4 rounded text-sm"
                        onClick={() => etidPrice()}> Edit price </button>
                        : <span></span>
                    }
                    { !(currAddress == data.seller || currAddress == data.owner) && (data.price == 0) ?
                        <div className="text-emerald-400">No price yet, contact owner</div>
                        : <span></span>
                    }
                    </div>
                    <div>
                        Owner: <span className="text-sm">{data.owner}</span>
                    </div>
                    <div>
                        Seller: <span className="text-sm">{data.seller}</span>
                    </div>
                    <div>
                    { currAddress == data.seller || currAddress == data.owner ?
                        <div className="text-emerald-400">You are the owner of this NFT</div>
                        : <span></span>
                    }
                    { !(currAddress == data.seller || currAddress == data.owner) && (data.price > 0) ?
                        <button className="enableEthereumButton bg-blue-500 hover:bg-blue-700 text-white
                        font-bold py-2 px-4 rounded text-sm"
                        onClick={() => buyNFT(tokenId)}> Buy this NFT </button>
                        : <span></span>
                    }
                    <div className="text-green text-center mt-3">{message}</div>
                    </div>
                </div>
                <div id="editForm" style={{ 
                    display: "none",
                    //display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    position: "fixed",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    zIndex: 999,
                    boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)" 
                }} className="p-80">
                    <form onSubmit={handleSubmit} className="bg-zinc-100 shadow-md
                        rounded px-20 pt-10 pb-20 mb-10 flex justify-center">
                        <label className="mx-3 border-2 border-gray-300 shadow-md p-4">
                            <div className=""> New Price: </div>
                            <input type="number" classname="border-2 border-gray-300 shadow-md p-4"
                                step="0.01" value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)} required />
                        </label>
                        <div className="flex flex-col">
                            <button type="submit" className="enableEthereumButton bg-blue-500 hover:bg-blue-700
                                text-white font-bold py-2 px-4 rounded text-sm m-3">
                            Update Price
                            </button>
                            <button type="button" className="enableEthereumButton bg-pink-500 hover:bg-pink-600
                                text-white font-bold py-2 px-4 rounded text-sm m-3"
                                onClick={() => document.getElementById("editForm").style.display = "none"}>
                            Cancel
                            </button>
                        </div>
                    </form>
                </div>
                {/* <div className="form-popup" id="editForm">
                    <form>
                        <div> {data.name} </div>
                        <div> {data.description} </div>
                        <div> {data.price} </div>
                    </form>
                </div> */}
            </div>
        </div>
    )
}