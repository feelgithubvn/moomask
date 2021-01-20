import {
  atom,
  selector,
  selectorFamily,
  waitForNone
} from 'recoil';

import Networks from '../config/networks'
import { precisionFormat } from '../utils/format-utils'
import { getProvider, loadSingle } from '../utils/token-utils'
import { BNB_CODE } from '../config/tokens'

const NetworkMap = {};
Networks.forEach(item => {
  NetworkMap[item.id] = item;
});

export const selectedNetworkId = atom({
  key: 'selectedNetworkId',
  default: 1,
  persistence_UNSTABLE: {
    type: 'selectedNetworkId'
  }
})

export const refreshCalled = atom({
  key: 'refreshCalled',
  default: 0
});

export const currentNetwork = selector({
  key: 'currentNetwork',
  get: ({get}) => {
    const selNet = get(selectedNetworkId)
    if(typeof NetworkMap[selNet] !== 'undefined') {
      return NetworkMap[selNet]
    }
    return null;
  },
  set: ({set}, newValue) => {
    if(typeof NetworkMap[newValue] === 'undefined') {
      throw new Error("Invalid network id")
    }

    set(selectedNetworkId, newValue)
  }
});

export const networkProvider = selector({
  key: 'networkProvider',
  get: ({get}) => {
    var network = get(currentNetwork)
    return getProvider(network);
  }
});

export const allWallets = atom({
  key: 'allWallets',
  default: [],
  persistence_UNSTABLE: {
    type: 'allWallets'
  }
});

export const allContracts = atom({
  key: 'allContracts',
  default: [],
  persistence_UNSTABLE: {
    types: 'allContracts'
  }
});

export const currentWallet = selector({
  key: 'currentWallet',
  default: null,
  get: ({get}) => {
    const all = get(allWallets);
    for(let i = 0; i < all.length; i++) {
      const single = all[i];
      if(single.current) {
        return single;
      }
    }
    return null;
  }
});

export const walletWithAddress = selectorFamily({
  key: 'walletWithAddress',
  default: null,
  get: ({address}) => ({get}) => {
    const all = get(allWallets);
    for(let i = 0; i < all.length; i++) {
      if(all[i].address === address) {
        return all[i];
      }
    }
    return null;
  }
});

export const allTokens = atom({
  key: 'allTokens',
  default: [],
  persistence_UNSTABLE: {
    type: 'allTokens'
  }
});

export const currentBalance = selectorFamily({
  key: 'currentBalance',
  default: 0,
  persistence_UNSTABLE: {
    type: 'currentBalance'
  },
  get: ({token}) => async( {get} ) => {
    get(refreshCalled)
    const network = get(currentNetwork);
    const wallet = get(currentWallet);

    const info = await get(tokenLoader({ token: token, network, address: wallet.address }));
    return info.balance;
  }
})

export const currentBalanceFormatted = selectorFamily({
  key: 'currentBalanceFormatted',
  default: 0,
  get: ({token}) => async ({get}) => {
    const amount = await get(currentBalance({token}))
    return precisionFormat(token.decimals)(amount);
  }
})

const loadUrl = async ( url ) => {
  try {
    const response = await fetch(url, {
      method: 'GET'
    });
    return response.json();
  } catch(e) {
    throw e;
  }
};

const mergeResults = (a, b) => {
  let merged = [];
  
  let i = 0, j = 0;

  while (i < a.length && j < b.length) {
    const at = parseInt(a[i].timeStamp);
    const bt = parseInt(b[j].timeStamp);
    if ((at - bt) > 0) {
        merged.push(b[j++]);
    } else {
        merged.push(a[i++]);
    }
  }

  if (j < b.length) {
      merged = merged.concat(b.slice(j));
  } else {
      merged = merged.concat(a.slice(i));
  }

  return merged.reverse();
}

export const networkTransactions = selectorFamily({
  key: 'networkTransactions',
  get: (fromBlock) => async ({get}) => {
    const network = get(currentNetwork);
    const wallet = get(currentWallet);
    get(refreshCalled);
    const startBlock = fromBlock ? fromBlock : 0;

    const fetchUrl = `${network.scan}?module=account&action=txlist&address=${wallet.address}&startblock=${startBlock}&endblock=99999999&apikey=${network.apiKey}`;

    const twentyUrl = `${network.scan}?module=account&action=tokentx&address=${wallet.address}&startblock=${startBlock}&endblock=99999999&apikey=${network.apiKey}`

    const [main, peggy] = await Promise.allSettled([loadUrl(fetchUrl), loadUrl(twentyUrl)])
    if(main && peggy && main.status && peggy.status) {
      if(main.status === "fulfilled" && peggy.status === "fulfilled") {
        const {value: mvalue} = main;
        const {value: pvalue} = peggy;

        if(mvalue.status === '1' && pvalue.status === '1') {
          const mr = mergeResults(mvalue.result, pvalue.result);
          return mr;
        } else if(mvalue.status === '1' && pvalue.status === '0') {
          return mvalue.result.reverse();
        } else if(mvalue.status === '0' && pvalue.status === '1') {
          return pvalue.result.reverse();
        }
      } else if(main.status === "fulfilled") {
        const {value: mvalue} = main;
        if(mvalue.status === '1') {
          return mvalue.result.reverse();
        }
      } else if(peggy.status === "fulfilled") {
        const {value: pvalue} = peggy;
        if(pvalue.status === '1') {
          return pvalue.result.reverse();
        }
      }
    }

    return [];
  }
});


export const tokenList = selector({
  key: 'tokenList',
  default: [],
  get: async ({get}) => {
    get(refreshCalled);
    const network = get(currentNetwork);
    const wallet = get(currentWallet);
    const tokens = get(allTokens);
    
    let toUseTokens = tokens.filter( item => {
      return item.code === BNB_CODE || (item.contract && item.contract[network.id]);
    });

    toUseTokens = toUseTokens.map(item => {
      if(item.code === BNB_CODE) {
        return item;
      }
      const cr = item.contract[network.id]
      return {...item, contract: cr};
    });
    
    const tokenLoadables = get(waitForNone(
      toUseTokens.map(token => tokenLoader({token: token, network, address: wallet.address}))
    ));

    return tokenLoadables
      .filter(({state, contents}) => { 
        return state === 'hasValue'
      })
      .map(({contents}) => contents);
  }
});

export const tokenLoader = selectorFamily({
  key: 'tokenLoader',
  get: ({token, network, address}) => async ({get}) => {
    get(refreshCalled)

    if (token.code === BNB_CODE) {
      const wallet = get(currentWallet)
      const web3 = get(networkProvider)
      const bal = await web3.eth.getBalance(wallet.address)
      return {...token, balance: bal};
    }
    const balance = await loadSingle(network, token, address);
    return {...token, balance};
  }
})


export const transactionDetails = selectorFamily({
  key: 'transactionDetails',
  get: ({hash}) => async ({get}) => {
    try {
      const allToks = await get(networkTransactions(0));
      for(let i = 0; i < allToks.length; i++) {
        let single = allToks[i];
        if(single.hash === hash) {
          console.log(single);
          return single;
        }
      }
    } catch(e) {
      console.error(e);
    }
    return {};
  }
});

export const homeSelectedTab = atom({
  key: 'homeSelectedTab',
  default: 0
});