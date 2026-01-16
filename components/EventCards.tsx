import Image from "next/image"
import Link from "next/link"

interface Props {
    title:string;
    image:string;
    location:string;
    date:string;
    time:string;
    slug:string
}

const EventCards = ({title,image,location,slug,time,date}:Props) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
    <Image src={image} alt="event-img" width={410} height={300} className="poster"/>
    <div className="flex gap-2">
        <Image src={'/icons/pin.svg'} alt="image" height={14} width={14}/>
        <p>{location}</p>
    </div>
    <p className="title">{title}</p>
    <div className="flex gap-2">
    <div className="flex gap-2">
        <Image src={'/icons/calendar.svg'} alt="image" height={14} width={14}/>
        <p>{date}</p>
    </div>
    <div className="flex gap-2">
        <Image src={'/icons/clock.svg'} alt="image" height={14} width={14}/>
        <p>{time}</p>
    </div>
    </div>
    </Link>
  )
}

export default EventCards