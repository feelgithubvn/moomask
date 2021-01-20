import React from 'react';
import Header from '../components/header'
import BackButtonHeader from '../components/back-button-header'
import {  Button, Container, TextField, FormControl, FormHelperText, Snackbar, Typography } from '@material-ui/core'
import { Alert } from '@material-ui/lab';
import { makeStyles } from '@material-ui/core/styles';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { deployContract } from '../utils/token-utils';
import { currentNetwork, currentWallet, networkProvider, allContracts } from '../store/atoms'
import { decryptKeyStore } from '../utils/keystore'


const useStyles = makeStyles((theme) => ({
  root: {
    textAlign: 'center',
    padding:theme.spacing(2),
    display:'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 104px)'
  },
  flexBox: {
    display: 'flex',
    flexDirection: 'column'
  },
  formWrap: {
    flex: 1,
  },
  form: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column'
  },
  formControl: {
    marginBottom: theme.spacing(2),
  },
  formButton: {
    marginBottom: theme.spacing(2)
  },
  fullWidth: {
    width: '100%'
  },
  cAdd: {
    wordBreak: 'break-all',
    display: 'block'
  }
}));

export default function DeployContract() {
  const classes = useStyles( );

  const [vals, setVals] = React.useState({name: '', abi: '', bytecode: ''});
  const [helpers, setHelpers] = React.useState({name: '', abi: '', bytecode: ''});
  const [error, setError] = React.useState({name: false, abi: false, bytecode: false});

  const [openSuccess, setOpenSuccess] = React.useState(false);
  const [errorSuccess, setErrorSuccess] = React.useState(false);

  const [contractAddress, setContractAddress] = React.useState('');

  const network = useRecoilValue( currentNetwork );
  const wallet = useRecoilValue( currentWallet );
  const provider = useRecoilValue( networkProvider );

  const setAllCont = useSetRecoilState(allContracts);

  const handleSubmit = (event) => {
    setErrorSuccess(false);
    event.preventDefault();

    const {abi, bytecode, name} = vals;
    if(!abi && !bytecode) {

      setHelpers(hs => {
        return {...hs, 
          abi: 'Please add ABI string',
          bytecode: 'Please add bytecode string'
        }
      });

      setError(hs => {
        return {...hs, abi: true, bytecode: true}
      });
      return;
    }
    if(!abi) {
      setHelpers(hs => {
        return {...hs, 
          abi: 'Please add ABI string'
        }
      });
      setError(hs => {
        return {...hs, abi: true}
      });
    }
    if(!bytecode) {
      setHelpers(hs => {
        return {...hs, 
          bytecode: 'Please add bytecode string'
        }
      });
      setError(hs => {
        return {...hs, bytecode: true}
      });
    }

    const unlocked = decryptKeyStore(provider, wallet.keystore, wallet.password)

    if(!unlocked) {
      // show message
      return false;
    }

    (async () => {
      try {
        const info = await deployContract(network, unlocked.privateKey, abi, bytecode);
        const {options: {address}} = info;

        setAllCont(all => {
          return [...all, {name, address}];
        });

        setContractAddress(address);
        setOpenSuccess(true);

        setVals({name: '', abi: '', bytecode: ''});
      } catch(e) {
        setErrorSuccess(true);
      }
    })()

  }
  

  return (
    <>
      <Header loggedIn={true}>
        <BackButtonHeader title="Deploy Contract" />
      </Header>
      <Container className={classes.root}>
        <div className={classes.formWrap}>
          {contractAddress && <Alert severity="info" icon={false}>
            <Typography variant="caption">Contract deployed at </Typography>
            <Typography variant="caption" className={classes.cAdd}><strong>{contractAddress}</strong></Typography>
          </Alert>}
          <form method="post" onSubmit={handleSubmit} className={classes.form} >

            <FormControl error={error.name} className={classes.formControl}>
              <TextField id="name" value={vals.name} onChange={e => setVals((vals) => { return {...vals, name:e.target.value}})}
                type="text" label="Name" />
              <FormHelperText>{helpers.name}</FormHelperText>
            </FormControl> 
            <FormControl error={error.abi} className={classes.formControl}>
              <TextField id="abi" value={vals.abi} onChange={e => setVals((vals) => { return {...vals, abi:e.target.value}})}
                type="text" label="ABI String"  required multiline rowsMax={4} />
              <FormHelperText>{helpers.abi}</FormHelperText>
            </FormControl>

            <FormControl error={error.bytecode} className={classes.formControl}>
              <TextField id="bytecode" value={vals.bytecode} onChange={e => setVals((vals) => { return {...vals, bytecode:e.target.value}})}
              type="text" label="Bytecode" required multiline rowsMax={4} />
              <FormHelperText>{helpers.bytecode}</FormHelperText>
            </FormControl>
            
            <Button variant="contained" color="primary" type="submit">Deploy</Button>
          </form>
        </div>

        

        <Snackbar open={openSuccess} autoHideDuration={6000} onClose={() => setOpenSuccess(false)}>
          <Alert onClose={() => setOpenSuccess(false)} severity="success">
            Contract deployed successfully!
          </Alert>
        </Snackbar>
        <Snackbar open={errorSuccess} autoHideDuration={6000} onClose={() => setErrorSuccess(false)}>
          <Alert onClose={() => setErrorSuccess(false)} severity="error">
            Unable to deploy Contract!
          </Alert>
        </Snackbar>
      </Container>
    </>
  )
}