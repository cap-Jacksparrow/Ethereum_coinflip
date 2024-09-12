import React, { useState, useEffect } from 'react';
import { contract, web3 } from './web3connect';
import { Container, TextField, Button, Typography, Paper, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import './App.css'; // Import the CSS file

function App() {
  const [account, setAccount] = useState('');
  const [betAmount, setBetAmount] = useState('');
  const [flipResult, setFlipResult] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        try {
          const accounts = await web3.eth.getAccounts();
          setAccounts(accounts);
          if (accounts.length > 0) {
            setAccount(accounts[0]); // Set the first account as the default
          }
          window.ethereum.on('accountsChanged', (accounts) => {
            setAccounts(accounts);
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            }
          });
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      } else {
        console.error("No Ethereum provider detected");
      }
    };

    loadWeb3();
  }, []);

  const handleBet = async (heads) => {
    const betInEther = parseFloat(betAmount);
    
    if (isNaN(betInEther) || betInEther <= 0) {
      console.error("Invalid bet amount:", betAmount);
      setSnackbarMessage("Please enter a valid bet amount.");
      setOpenSnackbar(true);
      return;
    }
  
    try {
      const amountInWei = web3.utils.toWei(betAmount, 'ether');
      console.log(`Placing bet: ${heads ? "Heads" : "Tails"}, Amount: ${amountInWei}`);
  
      // Send the transaction
      const tx = await contract.methods.flip(heads).send({ from: account, value: amountInWei });
      console.log("Transaction hash:", tx.transactionHash);
  
      // Wait for the transaction to be mined
      const receipt = await web3.eth.getTransactionReceipt(tx.transactionHash);
  
      // Decode the event logs
      const betResult = receipt.logs.find(log =>log.topics[0] === web3.utils.sha3('betResult(address,bool,uint256)')
      );
  
      if (betResult) {
        const decodedLog = web3.eth.abi.decodeLog(
          [
            { type: 'address', name: 'player' },
            { type: 'bool', name: 'result' },
            { type: 'uint256', name: 'amount' }
          ],
          betResult.data,
          betResult.topics.slice(1)
        );
  
        const result = decodedLog.result;
        console.log('Bet Result:', result ? 'Heads' : 'Tails');
  
        // Update the flip result and snackbar message
        if (result) {
          setFlipResult("You won!");
          setSnackbarMessage("Congratulations! You won!");
        } else {
          setFlipResult("You lost!");
          setSnackbarMessage("Sorry, you lost.");
        }
      } else {
        console.error("BetResult event not found");
        setSnackbarMessage("Unable to determine the result.");
      }
  
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Error placing bet:", error);
      setSnackbarMessage("An error occurred. Please try again.");
      setOpenSnackbar(true);
    }
  };
  
  

  return (
    <div className="App">
      <Container maxWidth="sm">
        <Paper className="paper">
          <Typography variant="h4" className="title" gutterBottom>CoinFlip Game</Typography>
          
          {/* Account Selector */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="account-selector-label">Connected Account</InputLabel>
            <Select
              labelId="account-selector-label"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              label="Connected Account"
            >
              {accounts.map((acc, index) => (
                <MenuItem key={index} value={acc}>
                  {acc}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            variant="outlined"
            label="Enter bet amount in ETH"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            fullWidth
            margin="normal"
            className="input-field"
          />
          <Button
            variant="contained"
            className="bet-button heads-button"
            onClick={() => handleBet(true)}
          >
            Bet on Heads
          </Button>
          <Button
            variant="contained"
            className="bet-button tails-button"
            onClick={() => handleBet(false)}
          >
            Bet on Tails
          </Button>
          <Typography variant="h6" className={`result ${flipResult.includes("won") ? "success" : "error"}`} gutterBottom>
            {flipResult}
          </Typography>
        </Paper>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert onClose={() => setOpenSnackbar(false)} severity={flipResult.includes("won") ? "success" : "error"}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
}

export default App;
