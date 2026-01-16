export interface Event {
  title: string;
  image: string;
  location: string;
  date: string;
  time: string;
  slug: string;
}

export const events: Event[] = [
  {
    title: "React Summit 2026",
    image: "/images/event1.png",
    location: "Amsterdam, Netherlands",
    date: "June 2-3, 2026",
    time: "9:00 AM - 6:00 PM",
    slug: "react-summit-2026",
  },
  {
    title: "Tech Crunch Disrupt",
    image: "/images/event2.png",
    location: "San Francisco, USA",
    date: "September 20-22, 2026",
    time: "8:30 AM - 5:30 PM",
    slug: "tech-crunch-disrupt-2026",
  },
  {
    title: "GraphQL Conf 2026",
    image: "/images/event3.png",
    location: "San Diego, USA",
    date: "October 11-12, 2026",
    time: "9:00 AM - 5:00 PM",
    slug: "graphql-conf-2026",
  },
  {
    title: "DevOps Days New York",
    image: "/images/event4.png",
    location: "New York, USA",
    date: "August 5-6, 2026",
    time: "8:00 AM - 6:00 PM",
    slug: "devops-days-ny-2026",
  },
  {
    title: "Web3 Dev Summit",
    image: "/images/event5.png",
    location: "Lisbon, Portugal",
    date: "May 15-17, 2026",
    time: "10:00 AM - 7:00 PM",
    slug: "web3-dev-summit-2026",
  },
  {
    title: "AI & Machine Learning Expo",
    image: "/images/event6.png",
    location: "London, UK",
    date: "July 22-24, 2026",
    time: "9:00 AM - 5:00 PM",
    slug: "ai-ml-expo-2026",
  },
];
