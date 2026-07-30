import { EditRequestForm } from "@/components/edit-request-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { requests, locations, categories, suppliers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";

export default async function EditRequestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sessionUser = session?.user as any;

  if (!sessionUser?.id) {
    redirect("/auth/signin");
  }

  const [requestData] = await db
    .select()
    .from(requests)
    .where(eq(requests.id, id))
    .limit(1);

  if (!requestData) {
    redirect("/requests");
  }

  // Only the submitter can edit it, and only if it's PENDING
  if (requestData.submittedByUserId !== sessionUser.id || requestData.status !== "PENDING") {
    redirect("/requests");
  }

  const locationsList = await db
    .select({ id: locations.id, name: locations.name })
    .from(locations)
    .orderBy(asc(locations.name));

  const categoriesList = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));

  const suppliersList = await db
    .select({ id: suppliers.id, name: suppliers.name })
    .from(suppliers)
    .orderBy(asc(suppliers.name));

  const containerMaxWidth = "max-w-lg";

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center pb-10">
      <div className={`w-full ${containerMaxWidth} mx-auto bg-white min-h-screen shadow-2xl sm:min-h-0 sm:mt-10 sm:rounded-[32px] sm:overflow-hidden flex flex-col relative`}>
        
        {/* Header */}
        <header className="bg-brand-red text-white px-6 py-8 sm:px-8 text-center rounded-b-3xl sm:rounded-none sm:rounded-t-[32px] shadow-md z-10 relative">
          <Link href="/">
            <Image 
              src="/images/walt_logo_white.png" 
              alt="Walt Landgoed Logo" 
              width={180}
              height={60}
              className="h-14 mx-auto object-contain relative z-10 mb-3"
            />
          </Link>
          <p className="text-white/90 font-medium text-[17px] relative z-10">Edit Supply Request</p>
        </header>

        {/* Form Container */}
        <div className="flex-1 px-5 py-8 sm:p-8 bg-gray-50/50 flex flex-col">
          <EditRequestForm 
            requestData={{
              id: requestData.id,
              farmLocation: requestData.farmLocation,
              category: requestData.category,
              itemDetails: requestData.itemDetails,
              quantity: requestData.quantity,
              urgency: requestData.urgency,
              supplier: requestData.supplier,
              requestedBy: requestData.requestedBy,
            }}
            locations={locationsList}
            categories={categoriesList}
            suppliers={suppliersList}
          />
        </div>
      </div>
    </main>
  );
}
