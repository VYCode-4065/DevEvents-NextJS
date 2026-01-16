import { Event } from "@/database";
import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { IEvent } from "@/database/event.model";

interface RouteParams {
  slug: string;
}

type GetResponse = IEvent | { message: string; error?: string };

/**
 * GET /api/events/[slug]
 * Fetches event details by slug
 */
export const GET = async (
  _req: NextRequest,
  { params }: { params: Promise<RouteParams> }
): Promise<NextResponse<GetResponse>> => {
  try {
    // Resolve dynamic route parameters
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { message: "Invalid slug parameter" },
        { status: 400 }
      );
    }

    // Trim and validate slug format (alphanumeric, hyphens)
    const sanitizedSlug = slug.trim().toLowerCase();
    if (!/^[a-z0-9-]+$/.test(sanitizedSlug)) {
      return NextResponse.json(
        { message: "Slug contains invalid characters" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Query event by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({message:"Event fetched successfully !",event}, { status: 200 });
  } catch (error) {
    console.error("Error fetching event:", error);

    return NextResponse.json(
      {
        message: "Failed to fetch event",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
};
