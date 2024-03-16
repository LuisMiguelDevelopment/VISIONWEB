import jwt from "jsonwebtoken";
import crypto from 'crypto';
import { TOKEN_SECRET } from "../config/config.js";


export const createTokenAccess =(payload)=>{
    return new Promise((resolve , reject)=>{
        jwt.sign(
            payload,
            TOKEN_SECRET,
            {
                expiresIn:"200d"    
            },
            (err,token)=>{
                if(err) reject(err);
                resolve(token);
            }
        )
    })
}


export const createRandomString = (length)=>{
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const bytes  = crypto.randomBytes(length);
    let result = '';
    for(let i = 0; i < length; i++){
        result += charset[bytes[i] % charset.length];
    }
    return result;
}