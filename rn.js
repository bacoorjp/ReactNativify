import React, { Component } from 'react';
import { Text, View } from 'react-native';
import './global';
import bitcoin from 'bitcoinjs-lib';
import CryptoJS from 'crypto-js';
let bip39 = require('bip39'); 
var HDKey = require('ethereumjs-wallet/hdkey');
export default class ReactNativeExamples extends Component {



  doTesting() {
   var mnemonic = bip39.generateMnemonic();

    // ニーモニックを暗号化する（多分ローカルに保存するための準備）
    // var encryptedMnemonic = g_Vault.encryptSimple(mnemonic);
    // console.log("log encryptedMnemonic: " + encryptedMnemonic);

    // データを保存するときはこんなやり方で
    // storeData("wSh_" + "Ethereum" + "_" + storageKey, JSON.stringify(seedHex),true);

    // ローカルから取り出す時のキーを作成
    // var storageKey = thirdparty.bitcoin.crypto.sha256(mnemonic + "-test").toString('hex');
    // console.log("log sha256: " + storageKey);

    // トランザクションのキャッシュを引っ張ってくる
    // var transactionCache = getStoredData('wTxCache_' + "Ethereum" + "_" + storageKey, true);
    // console.log("log transactionCache: " + transactionCache);
    function derive(node, index, hardened) {
        return (!!hardened) ? node.deriveHardened(index) : node.derive(index);
    }
    function getCoinAddress(node) {
        var ethKeyPair = node.keyPair;

        var prevCompressed = ethKeyPair.compressed;
        ethKeyPair.compressed = false;

        var ethKeyPairPublicKey = ethKeyPair.getPublicKeyBuffer();

        var pubKeyHexEth = ethKeyPairPublicKey.toString('hex').slice(2);

        var pubKeyWordArrayEth = CryptoJS.enc.Hex.parse(pubKeyHexEth);

        var hashEth = CryptoJS.SHA3(pubKeyWordArrayEth, { outputLength: 256 });

        var addressEth = hashEth.toString(CryptoJS.enc.Hex).slice(24);

        ethKeyPair.compressed = prevCompressed;
        var address = "0x" + addressEth;

        return address;
    }
    // ニーモニックをシードに変換する
    var seedHex = bip39.mnemonicToSeedHex(mnemonic);
    var masterSeed = bip39.mnemonicToSeed(mnemonic);
    // マスターキーである「Node」を生成
    // Depth = 0
    var rootNodeBase58 = bitcoin.HDNode.fromSeedHex(seedHex, null).toBase58();
    var rootNode = bitcoin.HDNode.fromBase58(rootNodeBase58, null);

    // Depth = 1
    var accountNodeBase58 = derive(derive(derive(rootNode, 44, true), 60, true), 0, true).toBase58();
    var accountNode = bitcoin.HDNode.fromBase58(accountNodeBase58, null);

    // Depth = 2
    var receiveNodeBase58 = derive(accountNode, 0, false).toBase58();
    var receiveNode = bitcoin.HDNode.fromBase58(receiveNodeBase58, null);
    var changeNodeBase58 = derive(accountNode, 1, false).toBase58();
    var changeNode = bitcoin.HDNode.fromBase58(changeNodeBase58, null);
    var wallet = HDKey.fromMasterSeed(masterSeed).derivePath("m/44'/60'/0'/0").deriveChild(0).getWallet();
    return {
      address:getCoinAddress(derive(receiveNode, 0, false)).toString(),
      mnemonic,
      priv: wallet.getPrivateKey().toString('hex')
    };
  }

  render() {
    const {address, mnemonic, priv} = this.doTesting();
    return (
      <View>

        <Text>{address}</Text>
        <Text>{mnemonic}</Text>
        <Text>{priv}</Text>
      </View>
    );
  }
}
