import { getSimilarEvents } from "@/actions/events/getSimilarEvent.actions";
import BookEvent from "@/components/BookEvent";
import EventCards from "@/components/EventCards";
import { IEvent } from "@/database";
import Image from "next/image";
import { notFound } from "next/navigation";

const EventDetails = ({icon,alt,label}:{icon:string,alt:string,label:string})=>(
    <div className="flex-row-gap-2">
        <Image src={icon} alt ={alt} width={17} height={17}/>
        <p>{label}</p>
    </div>
)

const EventAgenda = ({AgendaItems}:{AgendaItems:string[]})=>(
    <div className="agenda">
        <h3>Agenda</h3>
        <ul>
            {
                AgendaItems.map(agenda=>(
                    <li key={agenda}>{agenda}</li>
                ))
            }
        </ul>
    </div>
)

const EventTags = ({tags}:{tags:string[]})=>(
    <div className="flex flex-row gap-1.5 flex-wrap">
        {
            tags.map(tag=>(<div key={tag} className="pill">{tag}</div>))
        }
    </div>
)

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const bookings = 10;

const EventDetailsPage = async({params}:{params:Promise<string>}) => {

    const slug = await params
    const response = await fetch(`${BASE_URL}/api/events/${slug}`)

    const {event:{title,description,image,tags,audience,agenda,time,location,date,overview,venue,organizer,mode,_id:eventId}} = await response.json();


    if(!description) return notFound();

    const similarEvents:IEvent[] = await getSimilarEvents(slug)


  return (
    <section id="event">
        <div className="header">
            <h1>Event Description</h1>
            <p className="mt-2">{description}</p>
        </div>
        <div className="details">
            <div className="content">
                <Image src={image} alt="Event-banner" width={800} height={800} className="banner"/>
                <section className="flex-col-gap-2">
                    <h3>Overview</h3>
                    <p>{overview}</p>
                </section>
                <section className="flex-col-gap-2">
                    <h3>Event Details</h3>
                
                <EventDetails icon="/icons/calendar.svg" alt="calender" label={date}/>
                <EventDetails icon="/icons/clock.svg" alt="clock" label={time}/>
                <EventDetails icon="/icons/pin.svg" alt="location" label={location}/>
                <EventDetails icon="/icons/mode.svg" alt="mode" label={mode}/>
                <EventDetails icon="/icons/audience.svg" alt="audience" label={audience}/>
                </section>
                <EventAgenda AgendaItems={agenda}/>
                <section className="flex-col-gap-2">
                    <h3>About the Organizer</h3>
                    <p>{organizer}</p>
                </section>
                <EventTags tags={tags}/>
            </div>
            <aside className="booking">
                <div className="signup-card">
                    <h2 className="">Book Your Spot</h2>
                {
                    bookings>0?<p>Meet  {bookings} people who have already booked their spot !</p>:<p>Be the first to book the spot !</p>
                }
                <BookEvent eventId={eventId} slug={slug}/>
                </div>
            </aside>
        </div>
        <div className="mt-10">
            <h3>Similar Events </h3>
            {
                similarEvents.length>0?<div className="md:flex items-center gap-5 pt-10  w-full">
                {
                    similarEvents.map(event=>(<EventCards {...event} key={event.title}/>))
                }
            </div>:<p className="text-center text-cyan-500 text-lg font-semibold p-5 rounded-lg shadow-lg shadow-cyan-300 mt-10">No Similar Events Found</p>
            }   
            
        </div>
    </section>
  )
}

export default EventDetailsPage