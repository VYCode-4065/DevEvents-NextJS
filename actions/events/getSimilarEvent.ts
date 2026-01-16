'use server';

import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";

export const getSimilarEvents = async(slug:string)=>{
    try {
        await connectToDatabase();

        const slugEvent = await Event.findOne({slug});

        if(!slugEvent){
            return []
        }
        const similarEvents = await Event.find({_id:{$ne:slugEvent._id},tags:{$in:slugEvent.tags}}).lean();

        if(!similarEvents){
            return []
        }

        return similarEvents;
            
    } catch (error) {
        return []
    }
}