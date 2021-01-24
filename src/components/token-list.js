import React from 'react';
import { useRecoilValue } from 'recoil';
import { tokenList } from '../store/atoms';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { useTheme } from '@material-ui/core';

import { FixedSizeList } from 'react-window';
import { Avatar, ListItemAvatar } from '@material-ui/core';
import { selectedNetworkId } from '../store/atoms';
import { makeStyles } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { precisionFormat } from '../utils/format-utils';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  freeToken: {
    margin: theme.spacing(2),
    textAlign: 'center'
  },
  root: {
    paddingLeft:0,
    paddingRight:0
  }
}));

export default function TokenList() {
  const classes = useStyles( useTheme() );

  const list = useRecoilValue(tokenList);
  const network = useRecoilValue( selectedNetworkId );

  const renderRow = (props) => {
    const { index, style } = props;
    const di = list[index];
    return (
      <ListItem style={style} key={index} className="trans-list">
        <ListItemAvatar>
          {di.icon && <Avatar alt={di.title} src={`/images/tokens/${di.icon}`} />}
        </ListItemAvatar>
        <ListItemText primary={`${precisionFormat(di.decimals)(di.balance)} ${di.code}`} secondary={di.title} />
      </ListItem>
    );
  }

  return (<>
    {network === 2 && 
      <Alert severity="info" icon={false} className={classes.freeToken}>
        <strong>
          <a href="https://testnet.binance.org/faucet-smart" target="_blank" rel="noreferrer">Click here</a>
        </strong> to get some tokens
      </Alert>}
      <FixedSizeList className={classes.root} height={Math.min((window.innerHeight - 100), 70 * list.length)} width={'100%'} itemSize={70} itemCount={list.length}>
        {renderRow}
      </FixedSizeList>
  </>
  )  
}