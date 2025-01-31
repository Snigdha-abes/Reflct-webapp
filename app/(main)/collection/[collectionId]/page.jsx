import { getJournalEntries } from "@/actions/journal";
import { getCollection, getCollections } from "@/actions/collection";
import DeleteCollectionDialog from "../_components/delete-collection";
import { JournalFilters } from "../_components/journal-filters";



export default async function CollectionPage({ params }) {
  const { collectionId } =  params;
  const entries = await getJournalEntries({ collectionId });
  const collection=await getCollection(collectionId)
  console.log(entries, collection)
//   const collections =
//     collectionId !== "unorganized" ? await getCollections() : null;
//   const collection = collections?.find((c) => c.id === collectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between">
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold gradient-title">
            {collectionId === "unorganized"
              ? "Unorganized Entries"
              : collection?.name || "Collection"}
          </h1>
          {collection && (
            <DeleteCollectionDialog
              collection={collection}
              entriesCount={entries.data.entries.length}
            />
          )}
         </div>
        {collection?.description && (
          <h2 className="font-extralight pl-1">{collection?.description}</h2>
        )}
      </div>

      {/* Client-side Filters Component */}
      <JournalFilters entries={entries.data.entries} />
    </div>
  );
}

