import React, { useEffect, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AdbIcon from '@mui/icons-material/Adb';
import { connectWallet } from '../helpers/metamaskHeleper';
import { CircularProgress } from '@mui/material';
import Identicon from 'react-identicons';

const pages = [];
const settings = ['Logout'];

function ResponsiveAppBar() {
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [connectLoader, SetConnectLoader] = useState(false)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [accountAddress, setAccountAddress] = useState("")

    useEffect(() => {
        if (localStorage.getItem("account")) {
            setIsLoggedIn(true)
            setAccountAddress(localStorage.getItem("account"))
        }
    }, [isLoggedIn])

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const logout = () => {
        localStorage.clear();
        window.location.reload();
    }

    const handleConnectWallet = async () => {
        SetConnectLoader(true);
        const isLoggedIn = await connectWallet();
        if (isLoggedIn) {
            setIsLoggedIn(true)
            window.location.reload()
        }
        SetConnectLoader(false)
    }

    return (
        <AppBar position="static" style={{ backgroundColor: "#1976d2" }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1, color: "#FFF4D2" }} />
                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#FFF4D2',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>


                    <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1, color: "#FFF4D2" }} />
                    <Typography
                        variant="h5"
                        noWrap
                        component="a"
                        href=""
                        sx={{
                            mr: 2,
                            display: { xs: 'flex', md: 'none' },
                            flexGrow: 1,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: '#FFF4D2',
                            textDecoration: 'none',
                        }}
                    >
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        {isLoggedIn ?
                            <>
                                <Tooltip title="Open settings">
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Identicon string={accountAddress} size={30} bg="#fff"/>
                                        <Typography sx={{
                                            fontFamily: 'monospace',
                                            fontWeight: 700,
                                            fontSize : "0.2 rem",
                                            ml : 1
                                        }}>
                                            {accountAddress && accountAddress.slice(0, 5) + "..." + accountAddress.slice(-4)}
                                        </Typography>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    {settings.map((setting) => (
                                        <MenuItem key={setting} onClick={logout}>
                                            <Typography textAlign="center">{setting}</Typography>
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </>
                            :
                            <Button variant="outlined" onClick={handleConnectWallet} disabled={connectLoader} style={{color:"#fff", border:"1px solid rgb(248 248 248 / 50%)"}}>
                                {connectLoader && <CircularProgress />} Connect Wallet
                            </Button>
                        }
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default ResponsiveAppBar;
