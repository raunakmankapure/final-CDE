import axios from "axios"
import { LANGUAGAE_VERSIONS } from "./constants"

const API = axios.create({
    baseURL: "https://emkc.org/api/v2/piston"
})
export const executeCode = async (language, sourceCode) => {

    const response = await API.post("/execute", {
        "language": language,
        "version": LANGUAGAE_VERSIONS[language],
        "files": [
            {
                
                "content": sourceCode
            }
        ],
    });
    return response.data;

}