import EventCards from "@/components/EventCards"
import ExploreBtn from "@/components/ExploreBtn"
import { IEvent } from "@/database";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const Home = async() => {

  const response = await fetch(`${BASE_URL}/api/events`)

  const {events} = await response.json();


  return (
    <section className="my-5">
      <h1 className="text-center">The Hub for Every Dev <br />Event You can't Miss !</h1>
      <p className="text-center mt-3">Hackthons, Meetups, Conferences, All in one place .</p>
      <ExploreBtn/>
      <div className="mt-10 space-y-9">
        <h3>Featured Events</h3>
        <ul className="events list-none" >
          {
            events.map((event:IEvent)=><li key={event.title}>
              <EventCards {...event}/>
            </li>)
          }
        </ul>
      </div>
    </section>
  )
}

export default Home