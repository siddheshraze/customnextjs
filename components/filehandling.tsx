"use client";
import React, {useCallback, useState} from 'react';
import {useSession} from "next-auth/react";
import {
  DropzoneProps,
  DropzonePureProps,
  FileErrors,
  FileListProps,
  RowDataStructure, tableHeaders,
  UploadValidationProps
} from "@/config/macros";
import {ValidationErrorTable} from "@/components/validationtable";
import {usePlotContext} from "@/app/plotcontext";
import {FileRejection, FileWithPath, useDropzone} from 'react-dropzone';
import {parse, ParseConfig} from 'papaparse';
import {FileUploadIcon} from "@/components/icons";

import '@/styles/dropzone.css';
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  Pagination,
  Skeleton,
  Spinner
} from "@nextui-org/react";
import {Chip} from "@nextui-org/chip";
import {subtitle} from "@/config/primitives";
import {Button, getKeyValue, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@nextui-org/react";
import {IRecordSet} from "mssql";

/** COMPONENT STORAGE FOR FILE UPLOAD FUNCTIONS
 *
 * STORED COMPONENTS:
 * - FileList: generates file preview list
 * - DropzonePure: presentation side of dropzone box
 * - Dropzone: dropzone box upload logic/file type validation
 * - UploadAndValidateFiles: error display/upload completion display
 * - Filehandling: core logic for file upload/api fire
 */

/**
 * A simple list of files with their sizes.
 */
export function FileDisplay({acceptedFiles}: FileListProps) {
  const [currentPage, setCurrentPage] = React.useState(1);
  return (
    <>
      <Card className={"flex flex-1 justify-center w-auto"} radius={"lg"}>
        <CardHeader>
          File Preview:
        </CardHeader>
        <CardBody>
          <Skeleton isLoaded={acceptedFiles?.length > 0} className={"rounded-lg"}>
            <div className={"flex flex-1 flex-col h-auto rounded-lg"}>
              <div>
                File Name: <br/>
                <Chip
                  color={"primary"}>{(acceptedFiles?.length > 0 && acceptedFiles[currentPage - 1].path) ? acceptedFiles[currentPage - 1].path! : ''}</Chip>
              </div>
              <Divider className={"my-2"}/>
              <div>
                File Size: <br/>
                <Chip
                  color={"secondary"}>{(acceptedFiles?.length > 0 && acceptedFiles[currentPage - 1].size) ? acceptedFiles[currentPage - 1].size! : ''} bytes</Chip>
              </div>
            </div>
          </Skeleton>
        </CardBody>
        <CardFooter>
          <div className={"flex justify-center"}>
            {acceptedFiles.length > 1 && <Pagination total={acceptedFiles.length} color={"secondary"} page={currentPage}
                                                     onChange={setCurrentPage}/>}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

/**
 * This is the presentation component for Fileuploadcomponents.
 * It should be free of logic, and concentrate on the presentation.
 */
export function DropzoneCoreDisplay({getRootProps, getInputProps, isDragActive,}: DropzonePureProps) {
  return (
    <>
      <div id={"outerBox"} {...getRootProps()}
           className={"m-auto mt-8 border-sky-500 flex flex-col w-4/5 h-64 justify-center bg-[#46424f] align-middle"}>
        <div/>
        <p className={subtitle()} style={{textAlign: 'center'}}>
          {' '}
          <FileUploadIcon color="primary" size={80}/>{' '}
        </p>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className={subtitle()} color="primary" style={{textAlign: 'center'}}>
            Drop file here...
          </p>
        ) : (
          <p className={subtitle()} color="primary" style={{textAlign: 'center'}}>
            <b>Choose a CSV file</b> or drag it here.
          </p>
        )}
        <div/>
      </div>
    </>
  );
}


/**
 * A drop zone for CSV file uploads.
 */
export function DropzoneLogic({onChange}: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[], rejectedFiles: FileRejection[]) => {
      acceptedFiles.forEach((file: FileWithPath) => {
        const reader = new FileReader();
        
        reader.onabort = () => alert('file reading was aborted');
        reader.onerror = () => alert('file reading has failed');
        reader.onload = () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result as string;
          const config: ParseConfig = {delimiter: ','};
          const results = parse(binaryStr, config);
          
          //console.log(JSON.stringify(results.data));
          
          if (results.errors.length) {
            alert(
              `Error on row: ${results.errors[0].row}. ${results.errors[0].message}`
            );
            // Only print the first error for now to avoid dialog clog
          }
        };
        reader.readAsText(file);
      });
      
      onChange(acceptedFiles, rejectedFiles);
      rejectedFiles.forEach((fileRejection: FileRejection) => {
        alert(
          ' The file ' +
          fileRejection.file.name +
          ' was not uploaded. Only .csv files are supported.'
        );
      });
    },
    [onChange]
  );
  const {getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop, accept: {
      'text/csv': ['.csv'],
    }
  });
  
  return (
    <DropzoneCoreDisplay
      isDragActive={isDragActive}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
    />
  );
}

/**
 * For uploading and validating drag and dropped CSV files.
 */
function UploadAndValidateFiles({uploadDone, isUploading, errorsData, acceptedFiles, handleUpload, handleAcceptedFiles,}: UploadValidationProps) {
  if (uploadDone) {
    if (errorsData && Object.keys(errorsData).length == 0) {
      return (
        <div>
          {/*REVIEW UPLOAD CONTENT HERE*/}
          <p className={subtitle()}>
            Successfully uploaded.
          </p>
        </div>
      );
    } else {
      const filesWithErrorsList: FileWithPath[] = [];
      if (Object.keys(errorsData).length) {
        acceptedFiles.forEach((file: FileWithPath) => {
          if (Object.keys(errorsData).includes(file.name.toString())) {
            filesWithErrorsList.push(file);
          }
        });
      }
      
      // Show errors with the data that were uploaded
      return (
        <>
          <div className={"flex flex-col gap-5 w-3/5 h-3/5 justify-center"}>
            <ValidationErrorTable
              errorMessage={errorsData}
              uploadedData={filesWithErrorsList}
              headers={[
                // @todo: these are hardcoded.
                {label: 'Tag'},
                {label: 'Subquadrat'},
                {label: 'SpCode'},
                {label: 'DBH'},
                {label: 'Htmeas'},
                {label: 'Codes'},
                {label: 'Comments'},
              ]}
            />
          </div>
        </>
      );
    }
  }
  
  return (
    <>
      <div className={"grid grid-cols-2"}>
        <div>
          <DropzoneLogic onChange={handleAcceptedFiles}/>
        </div>
        <div className={"flex flex-col m-auto"}>
          <div className={"flex justify-center"}>
            <FileDisplay acceptedFiles={acceptedFiles}/>
          </div>
          <Divider className={"my-4"}/>
          <div className={"flex justify-center"}>
            <Button isDisabled={acceptedFiles.length <= 0} isLoading={isUploading} onClick={handleUpload}
                    spinnerPlacement={"start"} spinner={<Spinner color={"primary"} size={"sm"}/>}>
              Upload to server
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function Filehandling() {
  const [acceptedFiles, setAcceptedFiles] = useState<FileWithPath[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorsData, setErrorsData] = useState<FileErrors>({});
  const [uploadDone, setUploadDone] = useState(false);
  let currentPlot = usePlotContext();
  const {data: session} = useSession();
  
  async function handleUpload() {
    setIsUploading(true);
    setUploadDone(false);
    if (acceptedFiles.length == 0 || acceptedFiles) {
      console.log("accepted files is empty for some reason??");
    }
    const fileToFormData = new FormData();
    let i = 0;
    for (const file of acceptedFiles) {
      fileToFormData.append(`file_${i}`, file);
      i++;
    }
    
    const response = await fetch('/api/upload?plot=' + currentPlot!.key + '&user=' + session!.user!.name!, {
      method: 'POST',
      body: fileToFormData,
    });
    const data = await response.json();
    setErrorsData(data.errors);
    setIsUploading(false);
    setUploadDone(true);
  }
  
  if (!currentPlot || !currentPlot.key || !currentPlot.num) {
    return (
      <>
        <p>params doesn&apos;t exist OR plotkey doesn&apos;t exist OR plotnum doesn&apos;t exist</p>
      </>
    );
  }
  return (
    <>
      <UploadAndValidateFiles
        uploadDone={uploadDone}
        isUploading={isUploading}
        errorsData={errorsData}
        plot={currentPlot}
        acceptedFiles={acceptedFiles}
        handleUpload={handleUpload}
        handleAcceptedFiles={(acceptedFiles: FileWithPath[]) => {
          // @todo: what about rejectedFiles?
          setAcceptedFiles((files) => acceptedFiles.concat(files));
        }}
      />
    </>
  );
}