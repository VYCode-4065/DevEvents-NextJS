'use client';
import React, { useState } from 'react'


const BookEvent = () => {
    const [event,setEvent] = useState('')
    const [submitted,setSubmitted] = useState(false)

    function handleSubmit(e:React.FormEvent){
        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true)
        }, 1000);
    }
  return (
    <div id='book-event'>
        {
            submitted?<p className="text-sm">Thank Your for Signing Up !</p>:
            <form onSubmit={handleSubmit}>
                <div className=''>
                    <label htmlFor="email">Email Address</label>
                    <input required className='cursor-text' type="email" id="" placeholder='Enter your email address ' value={event} onChange={(e)=>setEvent(e.target.value)}/>
                </div>
                <button type="submit" className='button-submit'>Submit</button>
            </form>
        }
    </div>
  )
}

export default BookEvent