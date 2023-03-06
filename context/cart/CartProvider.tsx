import { ICartProduct, ISize } from '@/interfaces';
import { useEffect, useReducer } from 'react';
import { CartContext, cartReducer } from './';
import Cookie from 'js-cookie'

interface Props {
   children: JSX.Element | JSX.Element[];
}

export interface CartState {
    cart: ICartProduct[]
}

const CART_INITIAL_STATE: CartState = {
   cart: []
}

export const CartProvider: React.FC<Props> = ({children}) => {

    const [state, dispatch] = useReducer(cartReducer, CART_INITIAL_STATE);

    useEffect(() => {
        try {
            const cart = Cookie.get('cart') ? JSON.parse(Cookie.get('cart')!) : [] ;
            dispatch({ type:'[CART]-LOAD_FROM_COOKIES', payload: cart })
            
        } catch (error) {
            dispatch({ type:'[CART]-LOAD_FROM_COOKIES', payload: [] })
        }    
    }, [])
    

    useEffect(() => {
        Cookie.set('cart', JSON.stringify(state.cart));
    }, [state.cart])
    

    const addProductToCart = (product: ICartProduct) => {

        const productInCart = state.cart.some( p => p._id ===product._id && p.size === product.size );
        
        if(!productInCart) return dispatch({ type: '[CART]-UPDATE_CART_PRODUCTS', payload: [...state.cart, product] })
        
        // if product is already in cart, update quantity
        const updatedCart = state.cart.map(p => {
            if(p._id !== product._id ) return p;
            if(p.size !== product.size) return p;

            p.quantity += product.quantity;

            return p;
        });

        dispatch({ type: '[CART]-UPDATE_CART_PRODUCTS', payload: updatedCart })
    }

    const updateCartProduct = (product: ICartProduct) => {
        dispatch({type:'[CART]-UPDATE_PRODUCT_IN_CART', payload: product });
    }

    const removeProductFromCart = (product: ICartProduct) => {
        dispatch({type:'[CART]-REMOVE_PRODUCT_FROM_CART', payload: product });
    }
   return (
    <CartContext.Provider
        value={{
                ...state,
                addProductToCart,
                updateCartProduct,
                removeProductFromCart
            }}>
        {children}
    </CartContext.Provider>
    )
}
