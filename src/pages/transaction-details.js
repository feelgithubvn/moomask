import React from 'react';

import Header from '../components/header'
import BackButtonHeader from '../components/back-button-header'
import {  Button, Container } from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles';
import { currentNetwork, transactionDetails, allTokens } from '../store/atoms';
import { useRecoilValue } from 'recoil';

import { DEFAULT_TOKEN } from '../config/tokens'
import { Avatar } from '@material-ui/core';
import { precisionFormat, compressAddress, formatDateFromSeconds } from '../utils/format-utils';
import { Check } from '@material-ui/icons';

import { FileCopyOutlined } from '@material-ui/icons';

import Clipboard from 'react-clipboard.js';


const useStyles = makeStyles((theme) => ({
  root: {
    padding:theme.spacing(2),
    flex:1,
    display: 'flex',
    flexDirection: 'column'
  },
  avtar: {
    width: theme.spacing(7),
    height: theme.spacing(7)
  },
  clipboard: {
    '& svg': {
      marginLeft: theme.spacing(1),
      width: theme.spacing(2.5),
      height: theme.spacing(2.5)
    }
  },
  toparea: {
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  amount: {
    fontSize: '1.2rem',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: theme.spacing(2),
    '& .success': {
      fontSize: '.7rem',
      textTransform: 'uppercase',
      color: '#4caf50',
      display: 'flex',
      alignItems: 'center'
    }
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: '1',
    '& .row': {
      display: 'flex',
      alignItems: 'center',
      padding: theme.spacing(1),
      minHeight: theme.spacing(4),
      borderBottom: '1px solid #e1e1e1',
      '& .col:first-child': {
        color: '#666',
        width: '40%'
      },
      '& .col:last-child': {
        textAlign: 'right',
        width: '60%',
        display: 'flex',
        justifyContent: 'flex-end'
      }
    }
  }
}))


function ActualDetails({hash, tokensMap, network}) {
  const classes = useStyles( );

  const di = useRecoilValue(transactionDetails({hash}));
  const tokenValue = di.contractAddress && tokensMap[di.contractAddress.toUpperCase()] ? tokensMap[di.contractAddress.toUpperCase()] : DEFAULT_TOKEN;

  const success = di.isError === "0" ? true : false;
  
  return (<>
    <div className={classes.toparea}>
      {tokenValue.icon && 
        <Avatar alt={tokenValue.title} className={classes.avtar} src={`/images/tokens/${tokenValue.icon}`} />
      }
      <div className={classes.amount}>
        <span>{precisionFormat(tokenValue.decimals)(di.value)} {tokenValue.code}</span>
        {success && <span className="success">
          <Check />
          <strong>Success</strong>
          </span>}
      </div>
    </div>
    
    <div className={classes.grid}>
      <div className="row">
        <div className="col">Transaction Id:</div>
        <div className="col">
          <span className="text">{compressAddress(di.hash)}</span>
          <Clipboard component="span" className={classes.clipboard} button-href="#" data-clipboard-text={di.hash}>
            <FileCopyOutlined color="secondary"  />
          </Clipboard>
        </div>
      </div>
      <div className="row">
        <div className="col">From:</div>
        <div className="col">{compressAddress(di.from)}</div>
      </div>
      <div className="row">
        <div className="col">To: </div>
        <div className="col">{compressAddress(di.to)}</div>
      </div>
      <div className="row">
        <div className="col">Date:</div>
        <div className="col">{formatDateFromSeconds(di.timeStamp)}</div>
      </div>
    </div>

    <Button href={`${network.explore}/tx/${di.hash}`} target="_blank" color="primary" variant="contained">Check on explorer</Button>
  </>)
}

export default function TransactionDetail({match}) {
  const classes = useStyles( );
  const {hash} = match.params;

  const network = useRecoilValue(currentNetwork);
  
  const allTokensData = useRecoilValue(allTokens);

  const all_tokens_map = React.useMemo(() => {
    let mp = {};
    allTokensData.forEach((item) => {
      let {contract} = item;
      if(contract && contract[network.id]) {
        mp[contract[network.id].toUpperCase()] = item;
      }
    });
    return mp;
  }, [network, allTokensData])

  return (
    <>
      <Header loggedIn={true}>
        <BackButtonHeader title="Transaction" />
      </Header>
      <Container className={classes.root}>
        <React.Suspense fallback={<div>Loading...</div>}>
          <ActualDetails hash={hash} tokensMap={all_tokens_map} network={network}/>
        </React.Suspense>
      </Container>
    </>
  )
}