import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import {v2 as cloudinary} from 'cloudinary'

export const POST = async(req:NextRequest)=>{
    try {
        await connectToDatabase()

        const formData = await req.formData();

        let events = Object.fromEntries(formData.entries());

        const file = formData.get('image') as File;

        if(!file){
            return NextResponse.json({message:"Image is required !"},{status:400})
        }

      
       
        const arrayBuffer = await file.arrayBuffer()

        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((res,rej)=>{
            cloudinary.uploader.upload_stream({resource_type:'image',folder:'DevEvent'},(err,result)=>{

                if(err) return rej(err);

                res(result);
            }).end(buffer)
        })

        if(!uploadResult){
            return NextResponse.json({message:"Image upload failed !"},{status:500})
        }

        events.image = (uploadResult as {secure_url:string}).secure_url

        try {
            // Parse JSON strings to arrays
            console.log(events.agenda,events.tags)

            events.agenda = JSON.parse(events.agenda as string);
            events.tags = JSON.parse(events.tags as string);
            console.log(events.agenda,events.tags)

        } catch (error) {
            return NextResponse.json({message:"Invalid agenda or tags format"},{status:400})
        }


        const createdUser = await Event.create(events);

        if(!createdUser){
            return NextResponse.json({message:"Currently unable to create new event !"},{status:500})
        }
        
        return NextResponse.json({message:"Event Created successfully ",event:createdUser},{status:201})

    } catch (e) {
        console.log(e)
        return NextResponse.json({message:"Something went wrong in event post method ",error:e instanceof Error ? e.message:"Unknown"},{status:500})
    }
}

export const GET = async()=>{
    try {

        await connectToDatabase();

        const allEvents = await Event.find().sort({createdAt:-1});

        if(!allEvents){
            return NextResponse.json({message:"Unable to fetch events at this moment !"},{status:500})
        }

        return NextResponse.json({message:"Events fetched successfully !",events:allEvents},{status:200})

        
    } catch (err) {
        return NextResponse.json({message:'Fetching events failed !',error:err instanceof Error ?err.message:"Unknown"})
    }
}