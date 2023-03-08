import { Paper } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";

export const ConnectToWallet = () =>{
    return <>
        <Paper elevation={3} square sx={{mt:4}}>
            <Box sx={{display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center"}}>
                <img src="https://cdn-icons-png.flaticon.com/512/3757/3757881.png" alt="wallet" width={"25%"} height={"25%"}/>
                <h2 style={{padding:0, margin: 0}}>Connect Your Wallet</h2>
                <p>Please Connect your wallet to deposit funds to the Contract.</p>
            </Box>
        </Paper>
    </>
}

