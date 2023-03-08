import React, { useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { Box } from '@mui/system';
import { Add, Analytics, Balance, ContentCopy, PowerSettingsNew, RadioButtonChecked, Wallet } from '@mui/icons-material';
import { Button, FormControl, InputLabel, MenuItem, OutlinedInput, Paper, Select, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import "./home.scss"
import { CheckIfAdminLogin, depositFunds, getApprovalForErc20, getBalanceOfErc20TOken, getBroker, getDepositionEvents, getDepositionEventsForUser, getTotalDepositedAmount } from '../helpers/metamaskHeleper';
import { blockchainConfig } from '../config/blockchain-config';
import { ethers } from 'ethers';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ApprovalModal from './Modals/approvalModal';
import DepositModal from './Modals/depositModal';
import { ConnectToWallet } from './ConnectToWallet';



const names = [
    'Ethereum',
    'USDC',
    'USDT'
];
const imageSource = {
    Ethereum: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Ethereum-ETH-icon.png",
    USDT: "https://icons.iconarchive.com/icons/cjdowner/cryptocurrency-flat/512/Tether-USDT-icon.png",
    USDC: "https://seeklogo.com/images/U/usd-coin-usdc-logo-CB4C5B1C51-seeklogo.com.png"
}



export default function Home() {
    const [value, setValue] = React.useState(0);
    const [tokenName, setTokenName] = React.useState(names[0]);
    const [account, setAccount] = React.useState("")
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [balances, setBalance] = React.useState({
        Ethereum: 0,
        USDC: 0,
        USDT: 0
    })
    const [netDeposited, setNetDeposited] = React.useState({
        Ethereum: 0,
        USDC: 0,
        USDT: 0
    })
    const [userHistory, setUserHistory] = React.useState([])
    const [amount, setAmount] = React.useState(0)
    const [approvalPending,setApprovalPending] = useState(true)
    const [approvalModal, setApprovalModal] = useState(false)
    const [approvalStatus, setApprovalStatus] = useState(0) // 0 : fail, 1 : pass

    const [depositPending,setDepositPending] = useState(true)
    const [depositModal, setDepositModal] = useState(false)
    const [depositStatus, setDepositStatus] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
    const getBalanceForUser = async (user) => {
        const balance = {
            Ethereum: 0,
            USDC: 0,
            USDT: 0
        }
        const netDeposited = {
            Ethereum: 0,
            USDC: 0,
            USDT: 0
        }
        await Promise.all(names.map(async token => {
            if (token === "Ethereum") {
                balance.Ethereum = parseFloat(localStorage.getItem("balance")).toFixed(3)
            }
            else {
                try {
                    let balanceUsd = await getBalanceOfErc20TOken(user, blockchainConfig[token])
                    if (balanceUsd) {
                        balanceUsd = ethers.utils.formatUnits(balanceUsd.toString(), "ether");
                        balance[token] = parseFloat(balanceUsd).toFixed(3)
                    }

                } catch (error) {
                    console.log(error);
                    balance[token] = 0
                }
            }

            try {
                const depsAMt = await getTotalDepositedAmount(user, blockchainConfig[token]);
                if (depsAMt) {
                    netDeposited[token] = parseFloat(ethers.utils.formatEther(depsAMt.toString(), "ether")).toFixed(3)
                }
            } catch (error) {
                console.log(error);
            }
        }))

        setBalance(balance)
        setNetDeposited(netDeposited);

    }

    const getUserHistory = async(user) =>{
        let data = []
        if(isAdmin || !isLoggedIn){
            data = await getDepositionEvents();
        }
        else{
            data = await getDepositionEventsForUser(user)
        }
        
        setUserHistory(data.reverse())
    }

    const checkAdmin = async() =>{
        const isAdmin = await CheckIfAdminLogin();

        setIsAdmin(isAdmin)
        setValue(1)
    }
    useEffect(() => {
        if (localStorage.getItem("account")) {
            setIsLoggedIn(true)
            setAccount(localStorage.getItem("account"))
            getBalanceForUser(localStorage.getItem("account"));
            checkAdmin()
            getUserHistory(localStorage.getItem("account"))
        }
        else{
            getUserHistory(localStorage.getItem("account")) 
        }

    }, [account])

    const handleChangeToken = (event) => {
        const {
            target: { value },
        } = event;
        setTokenName(
            // On autofill we get a stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };

    const handleChangeAmount = (e) =>{
        setAmount(e.target.value)
    }


    const onsubmitDeposit = async() =>{
        const token = blockchainConfig[tokenName];
        const user = account
        const _amount = ethers.utils.parseUnits(amount.toString(),"ether");
        console.log(_amount, user, token);

        //step 1 get approval from user
        if(tokenName !== "Ethereum"){
            setApprovalModal(true);
            setApprovalPending(true)

            const isApproved = await getApprovalForErc20(_amount,blockchainConfig.paymentReciever, user, token);
            console.log(isApproved);

            if(isApproved){
                setApprovalPending(false);
                setApprovalStatus(1)
                setApprovalModal(false)
            }
            else{
                setApprovalPending(false)
                setApprovalStatus(0)
                setTimeout(()=>{
                    setApprovalModal(false)
                }, 1000)
                return
            }
        }

        //step 2 deposit funds

        setDepositModal(true)
        setDepositPending(true)

        try {
            const depositFund = await depositFunds(user, token, _amount)
            if(depositFund){
                setDepositPending(false);
                setDepositStatus(1)
                setTimeout(()=>{
                    setDepositModal(false)
                }, 2000)

                window.location.reload()
            }
            else{
                setApprovalPending(false)
                setApprovalStatus(0)
                setTimeout(()=>{
                    setApprovalModal(false)
                }, 1000)
                return
            }
        } catch (error) {
            console.log(error);
            setDepositPending(false)
            setApprovalStatus(0)
            setTimeout(()=>{
                setDepositModal(false)
            }, 2000)
        }
        
    }

    const showUserWallet = () => {
        return <>
            <Paper elevation={3} square style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
                <div className='wallet-header'>
                    <div className='account-info'>
                        <img src="https://cdn.iconscout.com/icon/free/png-256/metamask-2728406-2261817.png" alt="metamaks-icon" />
                        <div className='account-and-netwrok'>
                            <h3>Ethereum</h3>
                            <p>{account && (account?.slice(0, 5) + "..." + account?.slice(-5))}</p>
                        </div>
                    </div>
                    <div className='copy-logout'>
                        <div onClick={() =>navigator.clipboard.writeText(account)} style={{cursor:"pointer"}}>
                            <ContentCopy fontSize='small'/>
                        </div>
                        <div 
                        style={{cursor:"pointer"}} 
                        onClick={() =>{
                            localStorage.clear()
                            window.location.reload()
                        }}>
                            <PowerSettingsNew fontSize='small' />
                        </div>
                    </div>
                </div>
                <div className='wallet-detail-info'>
                    <div className='token-balance-info'>
                        <div>
                            <img src={imageSource.Ethereum} alt="ethereum" />
                            <p><strong>{balances.Ethereum}</strong>  ETH</p>
                        </div>
                        <p className='deposited-amt-detail'><span>{netDeposited.Ethereum}</span> <RadioButtonChecked fontSize='small' /></p>
                    </div>
                    <div className='token-balance-info'>
                        <div>
                            <img src={imageSource.USDT} alt="tether" />
                            <p><strong>{balances.USDT}</strong>  USDT</p>
                        </div>
                        <p className='deposited-amt-detail'><span>{netDeposited.USDT}</span> <RadioButtonChecked fontSize='small' /></p>
                    </div>
                    <div className='token-balance-info'>
                        <div>
                            <img src={imageSource.USDC} alt="usdc" />
                            <p><strong>{balances.USDC}</strong>  USDC</p>
                        </div>
                        <p className='deposited-amt-detail'><span>{netDeposited.USDC}</span> <RadioButtonChecked fontSize='small' /></p>
                    </div>
                </div>
            </Paper>
        </>
    }

    const showUserHistory = () => {
        return <>
            <Paper elevation={3} square style={{ display: "flex", alignItems: "center", flexDirection: "column", marginTop:"20px" }}>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="caption table">
                        <caption>User Activities</caption>
                        <TableHead>
                            <TableRow component={Paper} elevation={2} style={{backgroundColor:"#F7F6F6"}}>
                                <TableCell style={{fontWeight: 800, fontSize:"16px"}}>Wallet Address</TableCell>
                                <TableCell align="center" style={{fontWeight: 800, fontSize:"16px"}}>Amount</TableCell>
                                <TableCell align="center" style={{fontWeight: 800, fontSize:"16px"}}>Time</TableCell>
                                <TableCell align="center" style={{fontWeight: 800, fontSize:"16px"}}>Token</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {userHistory.map((data, i) => (
                                <>
                                {console.log(data)}
                                <TableRow key={i+1}>
                                    <TableCell component="th" scope="row" style={{fontSize:"15px", color:"rgb(95, 94, 94)"}} >
                                        {data.returnValues.from.slice(0,5) + "..." + data.returnValues.from.slice(-4)}
                                    </TableCell>
                                    <TableCell style={{fontSize:"15px", color:"rgb(95, 94, 94)"}} align="center">{parseFloat(ethers.utils.formatEther(data.returnValues.amount, "ether")).toFixed(5)}</TableCell>
                                    <TableCell style={{fontSize:"15px", color:"rgb(95, 94, 94)"}} align="center">{new Date(parseInt(data.returnValues.time + "000")).toDateString()}</TableCell>
                                    <TableCell style={{fontSize:"15px", color:"rgb(95, 94, 94)"}} align="center">{getTokenDetailsFRomEvent(data.returnValues.erc20Token)}</TableCell>
                                </TableRow>
                                </>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </>
    }

    const getTokenDetailsFRomEvent = (token) =>{
        if(token.toLowerCase() === blockchainConfig.Ethereum.toLowerCase()){
            return (<div className='user-history-token'>
                <img src={imageSource.Ethereum} alt="ethereum" width={"18px"} height={"18px"} style={{marginRight : "5px"}} />
                ETH
            </div>)
        }
        else if(token.toLowerCase() === blockchainConfig.USDT.toLowerCase()){
            return <div className='user-history-token'>
                <img src={imageSource.USDT} alt="usdt" width={"18px"} height={"18px"} style={{marginRight : "5px"}} />
                USDT
            </div>
        }
        else{
            return <div className='user-history-token'>
                <img src={imageSource.USDC} alt="usdc" width={"18px"} height={"18px"} style={{marginRight : "5px"}} />
                USDC
            </div>
        }
    }

    const showDepositForm = () => {
        return <>
            <Paper elevation={3} square>
                <h3 style={{ padding: "20px" }}>Deposit Tokens</h3>
                <div>
                    <FormControl sx={{ m: 1, minWidth: "90%" }}>
                        <div className='select-token'>
                            <FormControl sx={{ m: 1, minWidth: "200" }} className="select-token-input">
                                <InputLabel id="demo-simple-select-label">Token</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select"
                                    value={tokenName}
                                    onChange={handleChangeToken}
                                    label="token"
                                    size="small"
                                >
                                    {names.map((name) => (
                                        <MenuItem
                                            key={name}
                                            value={name}
                                        >
                                            {name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <div className='token-balance'>
                                <h4>Balance</h4>
                                <p><span>{returnTokenImage()}</span> {balances[tokenName]}</p>
                            </div>
                        </div>
                        <TextField
                            id="outlined-basic"
                            label="Amount"
                            variant="outlined"
                            size="small"
                            placeholder='Enter the Amount to Deposit'
                            sx={{ mt: 4 }}
                            type="number"
                            onChange={handleChangeAmount}
                            value={amount}
                        />
                        <Button variant="contained" sx={{ mt: 4, mb: 3 }} onClick={onsubmitDeposit} disabled={amount <= 0 || balances[tokenName] <= 0}>Submit</Button>
                    </FormControl>
                </div>
            </Paper>

            {/* modal for approval */}
            <ApprovalModal 
                open = {approvalModal}
                approvalPending = {approvalPending}
                approvalStatus = {approvalStatus}
            />

            {/* modal for approval */}
            <DepositModal 
                open = {depositModal}
                depositPending = {depositPending}
                depositStatus = {depositStatus}
            />
        </>
    }

    const showTabPanel = () => {
        switch (value) {
            case 0: if(!isLoggedIn){
                return <ConnectToWallet />
            }
                return showDepositForm()

            case 1: if(!isLoggedIn){
                return <ConnectToWallet />
            }
            return showUserWallet()

            default: return showUserHistory()
                break;
        }
    }

    const returnTokenImage = () => {
        return <>
            <img src={imageSource[tokenName]} width={"20px"} height={"20px"} />
        </>
    }

    return (
        <>
            <Box
                sx={{
                    width: "80%",
                    backgroundColor: '#fff',
                    '&:hover': {
                        backgroundColor: '#fff',
                        opacity: [0.9, 0.8, 0.7],
                    },
                }}
            >
                <Tabs value={value} onChange={handleChange} aria-label="icon label tabs example" variant="fullWidth" textColor='#E5D1FA'>
                    {!isAdmin && <Tab style={{ color: 'rgb(90, 90, 87)' }} icon={<Add fontSize='large' />} label="DEPOSIT" sx={{ m: 4 }} />}
                    <Tab style={{ color: 'rgb(90, 90, 87)' }} icon={<Wallet fontSize='large' />} label="WALLET" value={1} />
                    <Tab style={{ color: 'rgb(90, 90, 87)' }} icon={<Analytics fontSize='large' />} label="HISTORY" value={2} />
                </Tabs>
            </Box>
            <Box
                sx={{
                    width: "80%",
                }}
            >
                {showTabPanel()}

            </Box>
        </>

    );
}