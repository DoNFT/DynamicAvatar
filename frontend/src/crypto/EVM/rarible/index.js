import Evm from "@/crypto/EVM";
import RaribleConnector from "@/crypto/EVM/rarible/Connector";
import SmartContract from "@/crypto/EVM/SmartContract";
import {AppStorage, ConnectionStore, DecentralizedStorage, Token} from "@/crypto/helpers";

import {ActionTypes} from "@/crypto/helpers"
import {stringCompare} from "@/utils/string";
import {CollectionType} from "@/utils/collection";
import AppConnector from "@/crypto/AppConnector";

class Rarible extends Evm{

    connector = RaribleConnector

    constructor(){
        super()
    }

    async createBundle(tokens){
        const character = tokens.find(t => CollectionType.isBundle(t.contract.type))

        const haveInnerTokens = await this.getWrappedTokensObjectList(character.token.contractAddress, character.token.id)

        if(haveInnerTokens.length){
            return await this.addTokensToBundle(character.token, tokens.map(t => t.token).filter(t => !stringCompare(t.identity, character.token.identity)))
        }

        const {
            address,
            metaCID,
            tokensList
        } = await super.createBundle(tokens)

        const contract = new SmartContract({
            address,
            type: 'bundle'
        })

        const storage = AppStorage.getStore()

        storage.setProcessStatus(ActionTypes.minting_bundle)
        const result = await contract.makeBundle(tokensList, metaCID, storage.setProcessStatus)

        return {
            transactionHash: result.transactionHash,
            issuedContractAddress: address
        }
    }

    async applyEffectToToken({name, link, description}, original, effect){
        const {
            resultTokenCID,
            contractAddress,
            tokensList,
            tempImage
        } = await super.applyEffectToToken({name, link, description}, original, effect)


        const contract = new SmartContract({
            address: contractAddress,
            type: 'bundle'
        })

        const storage = AppStorage.getStore()
        storage.setProcessStatus(ActionTypes.minting_bundle)

        const result = await contract.makeBundle(tokensList, resultTokenCID, storage.setProcessStatus)

        return {
            transactionHash: result.transactionHash,
            issuedContractAddress: contractAddress,
            tempImage
        }
    }

    async addTokensToBundle(originToken, needToAddTokenList){
        const {
            addingTokenList
        } = await super.addTokensToBundle(needToAddTokenList)

        const contract = new SmartContract({
            address: originToken.contractAddress,
            type: 'bundle'
        })

        const store = AppStorage.getStore()
        await contract.approveTokenList(addingTokenList, store.setProcessStatus)

        store.setProcessStatus(ActionTypes.adding_to_bundle)
        const trn = await contract.addToBundle(originToken.id, addingTokenList)

        store.setProcessStatus(ActionTypes.generating_media)

        const bundleAge = originToken.attributes.find(t => t.trait_type === 'age')?.value
        const bundleMood = originToken.attributes.find(t => t.trait_type === 'mood')?.value

        const bundleCopy = JSON.parse(JSON.stringify(originToken))
        bundleCopy.inner.push(...needToAddTokenList)

        const {file} = await this.generateNewTokenImage(
            {
                age: bundleAge,
                mood: bundleMood
            },
            bundleCopy
        )


        // const applyImages = [...originToken.inner.map(t => t.image), ...needToAddTokenList.map(t => Token.getBaseFileURL(t.image))]
        // const {file} = await Token.applyAssets(
        //     process.env.VUE_APP_APPLY_EFFECT_ENDPOINT,
        //     originToken.origin.image_origin,
        //     applyImages
        // )

        const URI_id = Token.getFileIdByURL(originToken.origin.image)
        await DecentralizedStorage.changeFile(file, URI_id)
        store.updateTokenImageAndAttributes(originToken)


        // if current and origin images are the same it means that bundle is empty
        // if(originToken.origin.image === originToken.origin.image_origin){
        //     const newImageURL = await DecentralizedStorage.loadFile(file)
        //     const tokenNewMetaData = {
        //         ...originToken.origin,
        //         image: newImageURL
        //     }
        //     const URI_id = Token.getFileIdByURL(originToken.uri)
        //     await DecentralizedStorage.changeFile(tokenNewMetaData, URI_id)
        //     store.updateTokenImageAndAttributes(originToken, null, newImageURL)
        // }
        // else{
        //     // change current image (with saving image URL)
        //     const URI_id = Token.getFileIdByURL(originToken.origin.image)
        //     await DecentralizedStorage.changeFile(file, URI_id)
        //     store.updateTokenImageAndAttributes(originToken)
        // }

        return trn
    }

    async removeAssetsFromBundle(originToken, removeToken){
        const {
            removingTokens
        } = await super.removeAssetsFromBundle([removeToken])

        const store = AppStorage.getStore()

        const contract = new SmartContract({
            address: originToken.contractAddress,
            type: 'bundle'
        })
        const tx = await contract.removeFromBundle(originToken.id, removingTokens)


        store.setProcessStatus(ActionTypes.generating_media)

        const bundleAge = originToken.attributes.find(t => t.trait_type === 'age')?.value
        const bundleMood = originToken.attributes.find(t => t.trait_type === 'mood')?.value

        const bundleCopy = JSON.parse(JSON.stringify(originToken))
        bundleCopy.inner = bundleCopy.inner.filter(t => !stringCompare(t.identity, removeToken.identity))

        const {file} = await this.generateNewTokenImage(
            {
                age: bundleAge,
                mood: bundleMood
            },
            bundleCopy
        )

        const URI_id = Token.getFileIdByURL(originToken.origin.image)
        await DecentralizedStorage.changeFile(file, URI_id)
        store.updateTokenImageAndAttributes(originToken)

        // const originImage = originToken.origin.image_origin
        // const remainEffectImages = originToken.inner.filter(t => t.identity !== removeToken.identity).map(t => t.image)

        // if(remainEffectImages.length) {
        //     const {file} = await Token.applyAssets(
        //         process.env.VUE_APP_APPLY_EFFECT_ENDPOINT,
        //         originImage,
        //         remainEffectImages
        //     )
        //     const URI_id = Token.getFileIdByURL(originToken.origin.image)
        //     await DecentralizedStorage.changeFile(file, URI_id)
        //     store.updateTokenImageAndAttributes(originToken)
        // }
        // else {
        //     const tokenNewMetaData = {
        //         ...originToken.origin,
        //         image: originImage
        //     }
        //     const URI_id = Token.getFileIdByURL(originToken.uri)
        //     await DecentralizedStorage.changeFile(tokenNewMetaData, URI_id)
        //     store.updateTokenImageAndAttributes(originToken, null, originImage)
        // }

        return tx
    }

    async unbundleToken(token){
        const contract = new SmartContract({
            address: token.contractAddress,
            type: 'bundle'
        })
        return await contract.unwrapToken(token.id)
    }

    async createNewToken(meta, image, contractAddress){
        const {
            metaCID
        } = await super.createTokenMeta(meta, image)

        const contract = new SmartContract({
            address: contractAddress
        })
        const result = await contract.mint(ConnectionStore.getUserIdentity(), metaCID)
        result.issuedContractAddress = contractAddress
        return result
    }

    async sendNFT(tokenObject, toAddressPlain) {
        const {
            contractAddress,
            tokenID,
            fromAddress,
            toAddress
        } = await super.sendNFT(tokenObject, toAddressPlain)

        const Contract = new SmartContract({
            address: contractAddress
        })
        return await Contract.sendToken(tokenID, fromAddress, toAddress)
    }
}

export default Rarible