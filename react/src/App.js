import React, { useEffect, useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import abi from "./utils/WavePortal.json";

const getEthereumObject = () => window.ethereum;

// const findMetaMaskAccount = async () => {
//   try {
//     const ethereum = getEthereumObject();

//     if (!ethereum) {
//       console.error("Make sure you have Metamask!");
//       return null;
//     }

//     console.log("We have the Ethereum object", ethereum);
//     const accounts = await ethereum.request({ method: "eth_accounts" });

//     if (accounts.length !== 0) {
//       const account = accounts[0];
//       console.log("Found an authorized account:", account);
//       return account;
//     } else {
//       console.error("No authorized account found");
//       return null;
//     }
//   } catch (error) {
//     console.error(error);
//     return null;
//   }
// };

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const [sendingText, setSendingText] = useState("");
  const contractAddress = "0xF3476f4675CC14d397E70e4cffaBd12820837C16";
  const contractABI = abi.abi;
  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      await getAllWaves();
    } catch (error) {
      console.error(error);
    }
  };

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        /*
         * Execute the actual wave from your smart contract
         */
        const waveTxn = await wavePortalContract.wave(sendingText, {
          gasLimit: 300000,
        });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setSendingText("");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach((wave) => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          });
        });

        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      wavePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Hey What's Up 🌎</div>

        <div className="bio">
          Are You Curious To Know Who Am I? Take A Trip To My Social Media And
          Let Me Know What You Felt Or Any Development Ideas For Me To Pursue.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "Center",
            alignContent: "Center",
          }}
        >
          <a
            href="https://www.linkedin.com/in/tharaka-wijesundara/"
            target="_blank"
          >
            <img
              src="https://img.icons8.com/doodle/48/null/linkedin-circled.png"
              style={{
                margin: "10px",
                cursor: "pointer",
              }}
            />
          </a>
          <a
            href="https://www.instagram.com/tharaka_wijesundara/"
            target="_blank"
          >
            <img
              src="https://img.icons8.com/doodle/48/null/instagram-new.png"
              style={{
                margin: "10px",
                cursor: "pointer",
              }}
            />
          </a>
          <a href="https://github.com/tharakaWijesundara" target="_blank">
            {" "}
            <img
              src="https://img.icons8.com/doodle/48/null/github--v1.png"
              style={{
                margin: "10px",
                cursor: "pointer",
              }}
            />
          </a>
        </div>

        {/* <input
          type="text"
          value={sendingText}
          onChange={(e) => setSendingText(e.target.value)}
        /> */}
        <textarea
          className="textarea"
          value={sendingText}
          onChange={(e) => setSendingText(e.target.value)}
        />
        {/* </textarea> */}
        <button className="button" onClick={wave}>
          Send 🚀
        </button>

        {!currentAccount && (
          <button className="button" onClick={connectWallet}>
            Connect Wallet 🔗
          </button>
        )}
        <div className="msgContainer">
          {allWaves.map((wave, index) => {
            return (
              <div className="msgBox" key={index}>
                <div>Address: {wave.address}</div>
                <div>Time: {wave.timestamp.toString()}</div>
                <div>Message: {wave.message}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
