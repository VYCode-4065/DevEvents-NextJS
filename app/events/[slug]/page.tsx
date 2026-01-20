import EventDetailsPage from "@/components/EventDetails"
import { Suspense } from "react"

const page = ({params}:{params:Promise<{slug:string}>})=>{
    const slug = params.then(p=>p.slug)
    return <Suspense fallback = {<div>Loading......</div>}>
        <EventDetailsPage params={slug}/>
    </Suspense>
}

export default page