'use client';
import { bookEvent } from '@/actions/booking/bookEvent.actions';
import React, { useState } from 'react'


const BookEvent = ({eventId,slug}:{eventId:string,slug:string}) => {
    const [email,setEmail] = useState('')
    const [submitted,setSubmitted] = useState(false)

    async function handleSubmit(e:React.FormEvent<HTMLFormElement>){

       e.preventDefault();
        const response = await bookEvent({eventId,email,slug})
        setSubmitted(true)
        setEmail('');
        setTimeout(() => {
            setSubmitted(false)
        }, 3000);
    }
  return (
    <div id='book-event'>
        {
            submitted?<p className="text-sm">Thank Your for Signing Up !</p>:
            <form onSubmit={handleSubmit}>
                <div className=''>
                    <label htmlFor="email">Email Address</label>
                    <input required className='cursor-text' type="email" id="" placeholder='Enter your email address ' value={email} onChange={(e)=>setEmail(e.target.value)}/>
                </div>
                <button type="submit" className='button-submit'>Submit</button>
            </form>
        }
    </div>
  )
}

export default BookEvent