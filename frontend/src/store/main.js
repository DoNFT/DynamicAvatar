import {defineStore} from "pinia";
import {CollectionType} from "@/utils/collection";
import {catToFixed, stringCompare} from "@/utils/string";
import ModalController from "@/components/helpers/ModalController";
import {Networks} from "@/crypto/helpers";
import {log} from "@/utils/AppLogger";
import {Traits} from "@/crypto/helpers/Token";

function findTokenRecursively(findInToken, findIdentity) {
    if (stringCompare(findInToken.identity, findIdentity)) return findInToken
    for (const token of findInToken.inner) {
        const isFind = findTokenRecursively(token, findIdentity)
        if (isFind) return isFind
    }
    return null
}

import {getAvailableNetworks} from "@/crypto/helpers/Networks";
const availableNetworks = getAvailableNetworks()

export const useStore = defineStore('main', {
    state: () => ({
        isAppReady: false,
        collections: [],
        isCollectionsLoading: false,
        searchInput: '',
        preview: {
            isOpen: false,
            uniqueKey: '',
            token: null,
            contract: null,
            modifiers: []
        },
        isWalletConnectModalOpen: false,
        walletConnectCode: '',
        walletConnectCloseHandler: null,

        isBundleMode: false,
        selectedForBundle: {
            tokens: [],
            identities: [],
            loading: false
        },

        networks: availableNetworks,
        wallets: [
            {id: 1, name: 'MetaMask', key: 'Metamask', color: '#FFFFFF', available: true},
            {id: 3, name: 'WalletConnect', key: 'walletconnect', color: '#D9ECFF', available: true},
            {id: 2, name: '1inch', key: '1inch', color: '#0E131D', available: true},
        ],

        connection: {
            userIdentity: null,
            userNetworkName: null,
            userNetworkSupported: false
        },

        explorers: {
            transaction: '',
            account: '',
            block: ''
        },
        shopURL: '',

        processStatus: {
            code: '',
            addition: []
        },

        buyTokens: {
            [CollectionType.BUNDLE]: [
                /*{
                    "image":"https://ipfs.io/ipfs/bafybeicakwvqjaaodbeemresxcctnexfqgwj5ygty2qcn6ewg3iu4z7nj4/file",
                    "name":"Blue Fish",
                    "link":"https://pixabay.com/ru/",
                    "description":"This is blue fish",
                    "attributes": [
                        {
                            trait_type: 'age',
                            value: Traits.age.baby
                        },
                        {
                            trait_type: 'mood',
                            value: Traits.mood.general
                        }
                    ],
                    id: '123432',
                    contractAddress: 'gdfjhgjhkljgkfj',
                    identity: `123432:gdfjhgjhkljgkfj`,
                    fieldsForView: [
                        {key: 'name', value: 'Blue Fish'}
                    ],
                    inner: [],
                    innerLoading: false
                },*/
                {
                    isForBuy: true,
                    image: '/img/characters/male/im_perfect_anime.png',
                    name: 'Perfect anime',
                    description: 'Perfect anime (male)',
                    link: null,
                    attributes: [
                        {
                            trait_type: 'sex',
                            value: Traits.sex.male
                        },
                        {
                            trait_type: 'emoji',
                            value: Traits.emoji.im_perfect_anime
                        },
                        // {
                        //     trait_type: 'age',
                        //     value: Traits.age.baby
                        // },
                        // {
                        //     trait_type: 'mood',
                        //     value: Traits.mood.general
                        // }
                    ],
                },
                {
                    isForBuy: true,
                    image: '/img/characters/female/im_perfect_anime.png',
                    name: 'Perfect anime',
                    description: 'Perfect anime (female)',
                    link: null,
                    attributes: [
                        {
                            trait_type: 'sex',
                            value: Traits.sex.female
                        },
                        {
                            trait_type: 'emoji',
                            value: Traits.emoji.im_perfect_anime
                        }
                    ],
                },
                // {
                //     isForBuy: true,
                //     image: '/img/characters/teen-general.png',
                //     name: 'Teen',
                //     description: 'Teen general',
                //     link: null,
                //     attributes: [
                //         {
                //             trait_type: 'age',
                //             value: Traits.age.teen
                //         },
                //         {
                //             trait_type: 'mood',
                //             value: Traits.mood.general
                //         }
                //     ],
                // },

                /*{
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_2.jpeg',
                    name: 'Mountains 2',
                    cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                },
                {
                    isForBuy: true,
                    image: '/img/test-tokens/mountains_3.jpeg',
                    name: 'Mountains 3',
                    cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                }*/
            ],
            [CollectionType.EFFECT]: [
                {
                    isForBuy: true,
                    image: '/img/characters/star_1.png',
                    name: 'Star',
                    description: '',
                    link: null
                },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_1.jpeg',
                //     name: 'Mountains 1',
                //     cid: 'bafybeihoistczqwg3xyzebwjp2vtjtem3qryuukr5skwng2fcrhumvkdea/file'
                // },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_2.jpeg',
                //     name: 'Mountains 2',
                //     cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                // },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_3.jpeg',
                //     name: 'Mountains 3',
                //     cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                // }
            ],
            [CollectionType.NONE]: [
                {
                    isForBuy: true,
                    image: '/img/characters/star_1.png',
                    name: 'Star',
                    description: '',
                    link: null
                },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_1.jpeg',
                //     name: 'Mountains 1',
                //     cid: 'bafybeihoistczqwg3xyzebwjp2vtjtem3qryuukr5skwng2fcrhumvkdea/file'
                // },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_2.jpeg',
                //     name: 'Mountains 2',
                //     cid: 'bafybeie4cexpij2k6px4cprqektt6alkdvv2p7w4ujdnocmxs67dv75rpe/file'
                // },
                // {
                //     isForBuy: true,
                //     image: '/img/test-tokens/mountains_3.jpeg',
                //     name: 'Mountains 3',
                //     cid: 'bafybeigdiwy2iay2nnmxemzdfnvbbedmiwzg5pppnl2jcptbv4c3c4yxbe/file'
                // }
            ]
        },

        apply: {
            origin: {
                token: null,
                identity: null
            },
            style: {
                token: null,
                identity: null
            }
        },

        walletConnectModalOpen: true
    }),
    getters: {
        getFilteredCollections: state => type => state.collections.filter(collection => collection.type === type),
        userIdentityShort: state => catToFixed(state.connection.userIdentity || ''),
        getExplorerLink: state => (type, hash = '') => state.explorers[type]? state.explorers[type] + hash : state.explorers.transaction + hash,
        findContractObject: state => contractAddress => state.collections.find(collection => stringCompare(collection.address, contractAddress)),
        getContractType: state => contractAddress => {
            const contract = state.findContractObject(contractAddress)
            return contract? contract.type : null
        },
        checkContractType: state => (contractAddress, type) => {
            return state.getContractType(contractAddress) === type
        },
        getShopTokens: state => (type, contractAddress) => {
            return (state.buyTokens[type]? [...state.buyTokens[type]] : []).map(token => {
                token.contractAddress = contractAddress
                return token
            })
        },
        getSearchCollectionsAndTokens: state => {
            return state.collections
        },
        getTokenWithCollectionByIdentity: state => identity => {
            const [contractAddress, tokenID] = identity.split(':')
            const contract = state.findContractObject(contractAddress)
            if(contract) {
                return {
                    token: contract.tokens.find(t => stringCompare(t.id, tokenID)),
                    contract
                }
            }
            return null
        }
    },
    actions: {
        onLoginPageModalChange(value){
            this.walletConnectModalOpen = value
        },
        // updateTokenImageAndAttributes(token, newAttributed = null, newImage = null){
        updateTokenImageAndAttributes(token, newAttributed = null){
            setTimeout(() => {
                const updateData = token => {
                    const image = new URL(token.image)
                    const newHash = `${Date.now()}${Math.random()}`
                    image.searchParams.set('hash', newHash)
                    image.hash = `#${newHash}`

                    token.image = image.toString()

                    if(newAttributed){
                        token.attributes = newAttributed
                        token.origin.attributes = newAttributed
                    }
                }

                let tokenInStore = null
                loop1: for (const contract of this.collections) {
                    for (const storeToken of contract.tokens) {
                        const isFind = findTokenRecursively(storeToken, token.identity)
                        if (isFind) {
                            tokenInStore = isFind
                            break loop1
                        }
                    }
                }

                if (tokenInStore) updateData(tokenInStore)

                if (this.preview.token){
                    const tokenInPreview = findTokenRecursively(this.preview.token, token.identity)
                    if (tokenInPreview) updateData(tokenInPreview)
                }
            }, 300)
        },
        toggleTokenForBundle(token){
            if(this.selectedForBundle.identities.includes(token.identity)) this.selectedForBundle.identities = this.selectedForBundle.identities.filter(t => !stringCompare(t, token.identity))
            else this.selectedForBundle.identities.push(token.identity)
        },
        updateContractTokens(contractAddress, tokens){
            const isExist = this.findContractObject(contractAddress)
            if(isExist) isExist.tokens = tokens
        },
        changeContractUpdating(contractAddress, value){
            const isExist = this.findContractObject(contractAddress)
            if(isExist) isExist.isUpdating = value
        },
        changeCollectionLoadingState(value){
            this.isCollectionsLoading = value
        },
        setCollections(collections){
            this.collections = collections
            log('setCollections', collections)
        },
        setProcessStatus(statusCode = '', ...additionParams){
            this.processStatus.code = statusCode
            this.processStatus.addition.splice(0, this.processStatus.addition.length, ...additionParams)
        },
        openWalletConnectQR(copyCode, closeHandler){
            this.walletConnectCode = copyCode
            this.walletConnectCloseHandler = closeHandler
            this.isWalletConnectModalOpen = true
        },
        closeWalletConnectQR({isAutomatic = false} = {}){
            if(!isAutomatic && this.walletConnectCloseHandler) this.walletConnectCloseHandler()
            this.isWalletConnectModalOpen = false
            this.walletConnectCloseHandler = null
        },
        setAppReady(){
            this.isAppReady = true
        },
        setUserIdentity(value = null){
            this.connection.userIdentity = value
        },
        setUserNetworkName(value = null){
            this.connection.userNetworkName = value
            if(value){
                const {
                    transactionExplorer,
                    accountExplorer,
                    blockExplorer
                } = Networks.getData(value)
                this.explorers.transaction = transactionExplorer
                this.explorers.account = accountExplorer
                this.explorers.block = blockExplorer
                const {store} = Networks.getSettings(value)
                this.shopURL = store
            }
        },
        openPreview(token) {
            const contract = this.findContractObject(token.contractAddress)
            if(contract){
                const modifiers = CollectionType.canApplyEffect(contract.type)? this.getFilteredCollections(CollectionType.EFFECT) : []

                this.preview.token = token
                this.preview.contract = contract
                this.preview.modifiers = modifiers
                this.preview.isOpen = true

                ModalController.open(this.preview.uniqueKey = Symbol('preview'))
            }
        },
        setTokenInside(contractAddress, tokenID, insideTokenList){
            const contract = this.findContractObject(contractAddress)
            if(contract){
                const token = contract.tokens.find(t => t.id === tokenID)
                if(token) token.inner = insideTokenList
                if(this.preview.token && this.preview.token.identity === `${contractAddress}:${tokenID}`){
                    this.preview.token.inner = insideTokenList
                }
            }
        },
        changeLoadingInnerTokens(contractAddress, tokenID, newState){
            const contract = this.findContractObject(contractAddress)
            if(contract){
                const token = contract.tokens.find(t => t.id === tokenID)
                if(token) token.innerLoading = newState
            }
        },
        closePreview(){
            this.preview.isOpen = false
            setTimeout(() => {
                this.preview.token = this.preview.contract = null
                this.preview.modifiers = []
                ModalController.close(this.preview.uniqueKey)
            }, 300)
        },
        saveApplyEffect(originToken, styleToken){
            const config = {
                origin: originToken.identity,
                style: styleToken.identity
            }
            window.localStorage.setItem('apply-effect-config', JSON.stringify(config))
            this.apply.origin.token = originToken
            this.apply.origin.identity = originToken.identity
            this.apply.style.token = styleToken
            this.apply.style.identity = styleToken.identity
        },
        saveMakeBundle(){
            const config = this.selectedForBundle.identities
            window.localStorage.setItem('make-bundle-config', JSON.stringify(config))
        },
        restoreSavedTokensForBundle(){
            try{
                const config = JSON.parse(window.localStorage.getItem('make-bundle-config') || '[]')
                if(config && config.length){
                    this.selectedForBundle.identities = config
                    return config
                }
            }
            catch (e) {
                log('restoreApplyIdentities error', e)
            }
            return false
        },
        changeLoadingTokensForBundleState(newState){
            this.selectedForBundle.loading = newState
        },
        saveTokensForBundle(tokens){
            this.selectedForBundle.tokens = tokens
        },
        cleanSavedTokensForBundle(){
            window.localStorage.removeItem('make-bundle-config')
            this.selectedForBundle.tokens = []
            this.selectedForBundle.identities = []
        },
        restoreApplyIdentities(){
            try{
                const config = JSON.parse(window.localStorage.getItem('apply-effect-config') || '{}')
                if(config && config.origin && config.style){
                    this.apply.origin.identity = config.origin
                    this.apply.style.identity = config.style
                    return true
                }
            }
            catch (e) {
                log('restoreApplyIdentities error', e)
            }
            return false
        },
        saveRestoredTokensForApply(origin, style){
            this.apply.origin.token = origin
            this.apply.style.token = style
        },
        cleanSavedTokensForApply(){
            window.localStorage.removeItem('apply-effect-config')
            this.apply.origin.token = null
            this.apply.style.token = null
        }
    }
})