import axios from "axios";

const axiosInstance = axios.create({
    baseURL:"http://64.225.84.149:7000"
});

export default axiosInstance