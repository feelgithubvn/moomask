import React from 'react'

import {  Container, Typography } from '@material-ui/core'
import BackButtonHeader from '../components/back-button-header'

import { makeStyles } from '@material-ui/core/styles';

import Header from '../components/header'

const useStyles = makeStyles((theme) => ({
  root: {
    padding:theme.spacing(2),
    flex:1,
    display: 'flex',
    flexDirection: 'column'
  },
  bottomSpace: {
    marginBottom: theme.spacing(2)
  },
  spacer: {
    flex: '1'
  },
  partners: {
    '& img': {
      maxWidth: theme.spacing(40)
    }
  }
}));

export default function AboutUs() {
  const classes = useStyles( );

  return (
    <>
      <Header loggedIn={true}>
        <BackButtonHeader title="About Us" />
      </Header>
      <Container className={classes.root}>
      
        <Typography className={classes.bottomSpace}>MooMask is a browser extension wallet for Binance Smart Chain. MooMask enables you to access BSC Blockchain directly from your favorite browser.</Typography>

        <Typography className={classes.bottomSpace}>We never hold / have access to your private key. The private key is encrypted and only stored on your browser. For safety, always logout your wallet after using it.</Typography>
        <div className={classes.spacer}></div>
        <Typography variant="h5" className={classes.bottomSpace}>Partner</Typography>

        <div className={classes.partners}>
          <img src="images/moopay.png" alt="MooPay" />
        </div>

        <Typography variant="caption" display="block" >v0.0.12</Typography>
      </Container>
    </>
  )
}