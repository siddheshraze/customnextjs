"use client";
import {subtitle} from "@/config/primitives";
import * as React from "react";
import {Tabs, Tab} from "@nextui-org/react";
import ViewUploadedFiles from "@/components/viewuploadedfiles";
import {UploadAndReviewProcess} from "@/components/uploadreviewcycle";

// File Hub
export default function Files() {
  
  
  // Tab system -- Browse page, Upload page
  return (
    <>
      <p className={subtitle()}>Drag and drop files into the box to upload them to storage</p>
      <div className={"mt-5"}>
        <Tabs aria-label={"File Hub Options"} size={"sm"} className={""}>
          <Tab key={"browse"} title={"Browse"} >
            <ViewUploadedFiles />
          </Tab>
          <Tab key={"upload"} title={"Upload"} >
            <UploadAndReviewProcess />
          </Tab>
        </Tabs>
      </div>
    </>
  );
}
