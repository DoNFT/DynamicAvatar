import axios from "axios";

const AppAPI = axios.create({
    baseURL: process.env.VUE_APP_API_ENDPOINT,
    timeout: process.env.VUE_APP_API_TIMEOUT * 1000
})

export default AppAPI

export const HTTP = axios.create({
    timeout: process.env.VUE_APP_API_TIMEOUT * 1000
})

export const StorageAPI = axios.create({
    baseURL: process.env.VUE_APP_STORAGE_ENDPOINT,
    timeout: process.env.VUE_APP_API_TIMEOUT * 1000
})

export const IpnsAPI = axios.create({
    baseURL: process.env.VUE_APP_IPNS_ENDPOINT,
    timeout: process.env.VUE_APP_API_TIMEOUT * 1000
})