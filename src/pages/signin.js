import React from 'react';
import { useHistory } from 'react-router-dom'

import {Button, Box, TextField, FormControl, FormHelperText} from '@material-ui/core';

import { makeStyles, useTheme } from '@material-ui/core/styles';
import Header from '../components/header';
import { useRecoilState, useRecoilValue } from 'recoil';
import { networkProvider, currentWallet, allWallets } from '../store/atoms';
import { decryptKeyStore } from '../utils/keystore';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    padding:theme.spacing(2)
  },
  form: {
    display: 'flex',
    flexDirection: 'column'
  },
  fieldPassword: {
    marginBottom: theme.spacing(2)
  },
  formButton: {
    marginBottom: theme.spacing(2)
  },
  links: {
    width:'100%',
    display: 'block',
    marginTop: theme.spacing(2)
  }

}));


export default function Signin() {

  const classes = useStyles( useTheme() );
  const [pass, setPass] = React.useState('');
  const [error, setError] = React.useState(false);
  const [helperText, setHelperText] = React.useState('');

  const wallet = useRecoilValue(currentWallet);
  const [,setAllWallets] = useRecoilState(allWallets);
  const provider = useRecoilValue(networkProvider);
  
  const history = useHistory();

  React.useEffect(() => {
    if(wallet && wallet.password) {
      history.push('/home');
    }
  }, [wallet]); //eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (event) => {
    event.preventDefault();
    if(!wallet || !wallet.keystore) {
      setHelperText('No wallet found');
      setError(true);
    }

    try {
      decryptKeyStore(provider, wallet.keystore, pass);
      setAllWallets(wallets => {
        const all = [];
        for(let i = 0; i < wallets.length; i++) {
          const wal = wallets[i];
          all.push({...wal, password: pass});
        }
        return all;
      });
    } catch(e) {
      console.error(e);
      setHelperText('Unable to unlock valid, please try again');
      setError(true);
    }

    return false;
  }

  return(
    <>
      <Header loggedIn={false} />
      <Box className={classes.root}>
        <div className="auth-logo">
          <img src="images/moopay-logo.png" alt="MooMask" />
        </div>

        <h1 className="auth-title">MOOMASK</h1>

        <div className="message error"></div>
        <form method="post" autoComplete="off" onSubmit={handleSubmit} className={classes.form}>

          <FormControl className={classes.fieldPassword} error={error}>
            <TextField value={pass} onChange={(event) => { setPass(event.target.value); }} className={classes.fieldPassword} id="password" aria-describedby="password_helper" type="password" placeholder="Password"/>
            <FormHelperText>
              {helperText}
            </FormHelperText>
          </FormControl>
            
          <Button variant="contained" color="primary" type="submit" className={classes.formButton}>SignIn</Button>
          <div className="line-through">
            <span>or</span>
          </div>

        </form>
        
        <Button onClick={() => history.push('/create-wallet')} variant="contained" color="default" className={classes.links} >Create New Wallet</Button>
        <Button onClick={() => history.push('/import-wallet')} variant="contained" color="default" className={classes.links}  >Import Wallet from Private Key</Button>
      </Box>
    </>
    )
}