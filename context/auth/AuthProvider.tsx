import { useEffect, useReducer } from 'react';
import { useRouter } from 'next/router'
import axios from 'axios';
import Cookies from 'js-cookie';
import { AuthContext, authReducer } from './';
import { IUser } from '@/interfaces/';
import { tesloApi } from '@/api';


interface Props {
   children: JSX.Element | JSX.Element[];
}

export interface AuthState {
    isLogged: boolean;
    user?: IUser
}

const AUTH_INITIAL_STATE: AuthState = {
   isLogged: false
   
}

export const AuthProvider: React.FC<Props> = ({children}) => {

    const [state, dispatch] = useReducer(authReducer, AUTH_INITIAL_STATE);

    const { reload } = useRouter();

    useEffect(() => {
        checkToken();
    }, [])

    const checkToken = async () => {

        if( !Cookies.get('token') ) return;

        try {
            const { data } = await tesloApi.get('/user/validate-jwt');
            const { user, token } = data;
            
            Cookies.set('token', token);
                    dispatch({
                        type: '[AUTH]-LOG_IN',
                        payload: user
                    })
            
        } catch (error) {
            Cookies.remove('token');
        }
    }

    const loginUser = async ( email: string, password: string ): Promise<boolean>=> {
        
        try {
            const { data } = await tesloApi.post('/user/login', { email, password })    
            const { user, token} = data;
            
            Cookies.set('token', token);

            dispatch({
                type: '[AUTH]-LOG_IN',
                payload: user
            })

            return true;
        } catch (error) {
            return false;
        }

    }

    const registerUser = async ( name:string, email: string, password: string ): Promise<{ hasError: boolean, message?:string }> => {
            
            try {
                const { data } = await tesloApi.post('/user/register', { name, email, password })    
                const { user, token  } = data;
                
                Cookies.set('token', token);
    
                dispatch({
                    type: '[AUTH]-LOG_IN',
                    payload: user
                })
    
                return { 
                    hasError: false,
                }
            } catch (error) {
                if( axios.isAxiosError(error) ){
                    return {
                        hasError:true,
                        message: error.response?.data.message
                    }
                }
                return {
                    hasError:true,
                    message: 'Something went wrong, user coud not be created'
                }
            }
        }

    const logout = () => {
        Cookies.remove('cart');
        Cookies.remove('token');
        reload();        
    }

    return (
        <AuthContext.Provider
            value={{
                    ...state,

                    //Methods
                    loginUser,
                    registerUser,
                    logout
                }}>
            {children}
        </AuthContext.Provider>
    )
}
