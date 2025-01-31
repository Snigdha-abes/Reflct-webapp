"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import "react-quill-new/dist/quill.snow.css";
import { BarLoader } from "react-spinners";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getMoodById, MOODS } from "@/app/lib/mood";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { journalSchema } from "@/app/lib/schema";
import { createJournalEntry } from "@/actions/journal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createCollection, getCollections } from "@/actions/collection";
import CollectionForm from "@/components/collection-dialog";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

const JournalEntryPage = () => {
  const router = useRouter();

  // Fetch hook for submitting journal entry
  const { loading: actionLoading, fn: actionFn, data: actionResult } = useFetch(createJournalEntry);
  const [isCollectionDialogOpen,setIsCollectionDialogOpen]=useState(false)
  //fetch hook for fetching collections
  const {
    loading: collectionsLoading,
    data: collections,
    fn: fetchCollections
  }=useFetch(getCollections)

  const {
    loading: createCollectionLoading,
    fn: createCollectionFn,
    data: createdCollection,
  } = useFetch(createCollection);

  

  // Form configuration with validation
  const { register, handleSubmit, control, formState: { errors }, getValues,setValue,watch } = useForm({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      content: "",
      mood: "",
      collectionId: "",
    },
  });
  const mood = watch("mood");
  //call the fetchCollections by useEffect
  useEffect(()=>{
    fetchCollections()
  },[])

  // Handle the form submission
  const onSubmit = handleSubmit(async (data) => {
    try {
      const mood = getMoodById(data.mood);
      await actionFn({
        ...data,
        moodScore: mood.score,
        moodQuery: mood.pixabayQuery,
      });
    } catch (error) {
      toast.error("Failed to create journal entry. Please try again.");
    }
  });

  // Handle post-submission actions
  useEffect(() => {
    if (actionResult && !actionLoading) {
      router.push(`/collection/${actionResult.collectionId || "unorganized"}`);
      toast.success(`Entry created successfully!`);
    }
  }, [actionResult, actionLoading, router]);


  useEffect(() => {
    if (createdCollection) {
      setIsCollectionDialogOpen(false);
      fetchCollections();
      setValue("collectionId", createdCollection.id);
      toast.success(`Collection ${createdCollection.name} created!`);
    }
  }, [createdCollection]);

  const handleCreateCollection = async (data) => {
    createCollectionFn(data);
  };


  const isLoading = actionLoading;
  // const mood = watch("mood");

  return (
    <div className="py-8">
      <form className="space-y-4 mx-auto" onSubmit={onSubmit}>
        <h1 className="text-5xl md:text-6xl gradient-title">What's on your mind?</h1>
        {isLoading && <BarLoader color="orange" width={"100%"} />}
        
        {/* Title Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            disabled={isLoading}
            {...register("title")}
            placeholder="Give your entry a title..."
            className={`py-5 md:text-md ${errors.title ? "border-red-500" : ""}`}
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Mood Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">How are you feeling?</label>
          <Controller
            name="mood"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className={errors.mood ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a Mood..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(MOODS).map((mood) => (
                    <SelectItem key={mood.id} value={mood.id}>
                      <span className="flex items-center gap-2">
                        {mood.emoji} {mood.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.mood && <p className="text-red-500 text-sm">{errors.mood.message}</p>}
        </div>

       
        {/* Content Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {getMoodById (getValues("mood"))?.prompt || "Write your thoughts..."}
          </label>
          <Controller
            name="content"
            control={control}
            render={({ field }) => (
              <ReactQuill
                readOnly={isLoading}
                theme="snow"
                value={field.value}
                onChange={field.onChange}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link"],
                    ["clean"],
                  ],
                }}
              />
            )}
          />
          {errors.content && <p className="text-red-500 text-sm">{errors.content.message}</p>}
        </div>

        {/* Collection Input (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Add to Collection (Optional)
          </label>
          <Controller
            name="collectionId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  if (value === "new") {
                    setIsCollectionDialogOpen(true);
                  } else {
                    field.onChange(value);
                  }
                }}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a collection..." />
                </SelectTrigger>
                <SelectContent>
                  {collections?.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new">
                    <span className="text-orange-600">
                      + Create New Collection
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>


        {/* Submit Button */}
        <div className="space-y-4 flex">
          <Button type="submit" variant="journal" disabled={isLoading}>
            Publish
          </Button>
        </div>
      </form>
      <CollectionForm
        loading={createCollectionLoading}
        onSuccess={handleCreateCollection}
        open={isCollectionDialogOpen}
        setOpen={setIsCollectionDialogOpen}
      />
    </div>
  );
};

export default JournalEntryPage;
