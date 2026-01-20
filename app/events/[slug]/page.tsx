import EventDetailsPage from "@/components/EventDetails"
import { Suspense } from "react"

const page = ({params}:{params:Promise<{slug:string}>})=>{

    return <Suspense >
        <EventDetailsPage params={params}/>
    </Suspense>
}

export default page