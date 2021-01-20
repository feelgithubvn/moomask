import React from 'react'

import { useHistory } from 'react-router-dom'

import {Button, Box, TextField, FormControl, FormHelperText} from '@material-ui/core';
import {Alert} from '@material-ui/lab'

import { makeStyles, useTheme } from '@material-ui/core/styles';

import Clipboard from 'react-clipboard.js';

import Header from '../components/header';
import { encryptKeyStore } from '../utils/keystore';

import { useRecoilState, useRecoilValue } from 'recoil';

import { allWallets, currentWallet, networkProvider } from '../store/atoms';

const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    padding:theme.spacing(2)
  },
  flexBox: {
    display: 'flex',
    flexDirection: 'column'
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
  fullWidth: {
    width:'100%'
  },
  links: {
    width:'100%',
    display: 'block',
    marginTop: theme.spacing(2)
  },
  important: {
    marginBottom: theme.spacing(2)
  },
  keyInfo: {
    textAlign: 'left'
  },
  copyGroup: {
    display: 'flex',
    '& textarea': {
      width: '100%',
      border: '1px solid #ccc',
      borderRight: 'none',
      background: '#fafafa',
      borderRadius: '2px 0 0 2px',
      '&:focus': {
        outline: 'none',
        background: '#f3f3f3'
      }
    },
    '& button': {
      cursor: 'pointer',
      width: '50px',
      background: '#f1f1f1',
      border: '1px solid #ccc',
      borderLeft: 'none',
      borderRadius: '0 2px 2px 0',
      '& svg': {
        width: '15px'
      }
    }
  }

}));

const helperTextString = 'This password encrypts your private key. Make sure to remember this password as you will need it to unlock your wallet.';
const helperErrorString = 'Invalid Password, should be atleast 8 characters long';

export default function CreateWallet() {
  const classes = useStyles( useTheme() );

  const [, setWalletAtom] = useRecoilState(allWallets)

  const provider = useRecoilValue(networkProvider)
  const cWallet = useRecoilValue(currentWallet)

  const [pass, setPass] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [helperText, setHelperText] = React.useState(helperTextString)

  const [wallet, setWallet] = React.useState(null)

  const history = useHistory();

  React.useEffect(() => {
    if(cWallet && cWallet.password) {
      history.push('/home');
    }
  }, [cWallet]); //eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (event) => {
    event.preventDefault();
    if(!pass || pass.length < 8) {
      setHelperText(helperErrorString)
      setPasswordError(true)
      return false;
    } else {
      setHelperText(helperTextString)
      setPasswordError(false);
    }
    
    setWallet(provider.eth.accounts.create());
  }

  const copyConfirmed = (event) => {
    event.preventDefault();
    const keystore = encryptKeyStore(provider,  wallet.privateKey, pass);

    setWalletAtom((current) => {
      const all = [...current];
      all.push({
        address: wallet.address,
        password: pass,
        keystore: keystore,
        current: true
      })
      return all;
    });
    
    history.push('/');

    return false;
  }

  return (
    <>
      <Header loggedIn={false} />
      <Box className={classes.root}>
        <div className="auth-logo">
          <img src="images/moopay-logo.png" alt="MooMask" />
        </div>

        <h1 className="auth-title">MOOMASK</h1>
        
        { !wallet && 
          <>
            <form method="post" autoComplete="off" onSubmit={handleSubmit} className={classes.form}>
              <FormControl className={classes.fieldPassword} error={passwordError}>
                <TextField id="password" value={pass} onChange={e => setPass(e.target.value)}
                  aria-describedby="password_helper" type="password" placeholder="New Password(min 8 chars)"/>
              <FormHelperText>
                {helperText}
              </FormHelperText>
              </FormControl>
              <Button variant="contained" color="primary" type="submit" className={classes.formButton}>Create new wallet</Button>
            </form>
            <Button onClick={() => { history.push('/'); }} variant="contained" className={classes.fullWidth}>Cancel</Button>
          </>
        }

        { wallet && 
          <Box className={classes.flexBox}>
            <Alert severity="error" className={classes.important}>
              SAVE YOUR PRIVATE KEY
            </Alert>

            <div className={classes.copyGroup}>
              <textarea type="text" rows="3" readOnly value={wallet.privateKey}></textarea>
              <Clipboard component="button" button-href="#" data-clipboard-text={wallet.privateKey}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="icon"><path d="M6 6V2c0-1.1.9-2 2-2h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V8c0-1.1.9-2 2-2h4zm2 0h4a2 2 0 0 1 2 2v4h4V2H8v4zM2 8v10h10V8H2z"/></svg>
              </Clipboard>
            </div>

            <div className={classes.keyInfo}>
              <p><strong>Do not lose it!</strong> It can't be recovered if you lose it.</p>
              <p><strong>Do not share it!</strong> Your funds will be stolen if you use it on a malicious site.</p>
              <p><strong>Make a backup!</strong> Just in case your laptop is set on fire.</p>
            </div>
            <Button variant="contained" color="primary" onClick={copyConfirmed}>I've copied it somewhere safe</Button>
          </Box>
        }
      </Box>
    </>
  )
}