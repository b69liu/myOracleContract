import React, { useState , useRef, useEffect, useMemo } from "react";
import './App.css';
import { ethers } from "ethers";
import ExchangeRateAbi from "./abi/ExchangeRateOracleAbi.json";
import axios from "axios";

const SERVER_URL = 'http://localhost:8080';
function App() {
  useEffect(() =>{
    window.ethereum.request({ method: 'eth_requestAccounts' });
  },[])

  const [usdToCad, setUsdToCad] = useState(null);
  const inputRef = useRef(null);
  const loadRate = async ()=>{
    try{
      const address = inputRef.current.value;
      if(!address){
        console.log("Empty address!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const EchangeRateContractUnsigned =  new ethers.Contract( address , ExchangeRateAbi,provider);
      let result = await EchangeRateContractUnsigned.usdToCad();
      const rate = parseFloat(result.toNumber());
      setUsdToCad(rate);
      console.log("today's rate is ",rate);
    }catch(err){
      console.error(err);
    }
  }
  const updateRate = async ()=>{
    try{
      const address = inputRef.current.value;
      if(!address){
        console.log("Empty address!");
        return;
      }
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const EchangeRateContractUnsigned =  new ethers.Contract( address , ExchangeRateAbi, provider);
      const SignedContract = EchangeRateContractUnsigned.connect(signer);
      const result = await axios.get(SERVER_URL,{
        headers: {
          'Access-Control-Allow-Origin': '*',
        }});
      const rate = parseFloat(result.data.usdToCad) * 10000;
      console.log("today's rate is ",rate);
      SignedContract.setUsdToCad(rate);
    }catch(err){
      console.error(err);
    }
  }

  return (
    <div className="App">
      <input 
        type="text" 
        placeholder="Contract Address"
        ref={inputRef}
      />
       <input disabled value={usdToCad || "unknown"}/>
      <button className="read" onClick={loadRate}>Read Rate</button>
      <button className="update" onClick={updateRate}>Update Rate</button>
    </div>
  );
}

export default App;
