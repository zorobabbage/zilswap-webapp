import React, { useMemo, useState } from "react";
import { makeStyles, useTheme } from "@material-ui/core";
import { toBech32Address } from "@zilliqa-js/crypto";
import cls from "classnames";
import { useSelector } from "react-redux";
import { Blockchain } from "carbon-js-sdk";
import { Network } from "zilswap-sdk/lib/constants";
import { useNetwork } from "app/utils";
import { AppTheme } from "app/theme/types";
import { BridgeableTokenMapping, RootState } from "app/store/types";
import legacySvg from "./legacy-zil.svg";

const useStyles = makeStyles((theme: AppTheme) => ({
  root: {
    width: 30,
    height: 30,
    display: "flex",
    borderRadius: 14,
    padding: 2,
  },
  svg: {
    maxWidth: "100%",
    width: "unset",
    height: "unset",
    flex: 1,
  },
}));

const CurrencyLogo = (props: any) => {
  const { currency, address, className, blockchain, legacy }: {
    currency: string | false;
    address: string;
    className: string;
    blockchain?: Blockchain;
    legacy?: boolean;
  } = props;
  const classes = useStyles();
  const bridgeTokens = useSelector<RootState, BridgeableTokenMapping>((state) => state.bridge.tokens);
  const theme = useTheme();
  const [error, setError] = useState<boolean>(false);
  const network = useNetwork();

  const urlSuffix = theme.palette.type === "dark" ? '?t=dark' : '';
  const isZil = typeof currency === "string" && ["eZIL", "ZIL"].includes(currency);
  let tokenIconUrl: string

  const logoAddress = useMemo(() => {
    if (blockchain === Blockchain.Ethereum) {
      const tokenHash = address.replace(/^0x/i, "");
      const bridgeToken = bridgeTokens.eth.find((bridgeToken) => bridgeToken.tokenAddress === tokenHash)

      if (bridgeToken) {
        return toBech32Address(bridgeToken.toTokenAddress);
      }
    }

    return address;
  }, [blockchain, address, bridgeTokens.eth])

  if (network === Network.TestNet) {
    if (isZil)
      tokenIconUrl = `https://meta.viewblock.io/ZIL/logo${urlSuffix}`
    else
      tokenIconUrl = `https://dr297zt0qngbx.cloudfront.net/tokens/testnet/${logoAddress}`
  } else {
    let tokenKey = isZil ? '' : `.${logoAddress}`
    if (logoAddress?.startsWith("0x") && !isZil)
      tokenKey = `ZIL.${toBech32Address(logoAddress)}`;
    tokenIconUrl = `https://meta.viewblock.io/ZIL${tokenKey}/logo${urlSuffix}`
  }
  const fallbackImg = `https://meta.viewblock.io/ZIL.notfound/logo${urlSuffix}`;

  return (
    <div className={cls(classes.root, className)}>
      {legacy
        ? <img
          className={classes.svg}
          src={legacySvg}
          alt={`${currency} Token Logo`}
          loading="lazy"
          onError={(() => setError(true))}
        />
        : <img
          className={classes.svg}
          src={error ? fallbackImg : tokenIconUrl}
          alt={`${currency} Token Logo`}
          loading="lazy"
          onError={(() => setError(true))}
        />}
    </div>
  )
};

export default CurrencyLogo;
