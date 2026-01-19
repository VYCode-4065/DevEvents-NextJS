'use server'

import { Booking } from "@/database";
import connectToDatabase from "@/lib/mongodb";

export const bookEvent = async({eventId,email,slug}:{eventId:string,email:string,slug:string})=>{
    try {

        await connectToDatabase();


        if(!eventId || !email || !slug){
           console.log('Event id and email are required !')
           return;
        }

        const existedUser = await Booking.find({eventId,email,slug})

        if(existedUser){
            return {message:"Event already booked !"}
        }

        await Booking.create({eventId,email,slug})

        return {message:"Event booked successfully !"};
        
        
    } catch (error) {
        console.log('Book event is failed')
        throw error;
    }
}