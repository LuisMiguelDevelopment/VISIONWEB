import {z} from 'zod'


export const registerSchema = z.object({
    NameUser: z.string({
        required_error: "User Names is required field"
    }),
    LastName : z.string({
        required_error: "Last Name is a required field"
    }),
    Email: z.string({
        required_error : "Email address is a required field"
    }).email({
        message: "Invalid email address"
    }),
    PasswordKey: z.string({
        required_error: "Password is a required field"
    }).min(6,{
        message: 'password must be at least 6 characters long'
    }),
    DateBirth: z.string({
        required_error: "Date of birth is a required field"
    })

})



export const loginSchema = z.object({
    Email: z.string({
        required_error: "Email address is a required field"
    }).email({
        message: "Invalid email address"
    }),
    PasswordKey: z.string({
        required_error: 'Password is required field'
    }).min(6,{
        message:'Password  must be at least 6 characters long'
    })  
})