"use client";
import { useState } from 'react';
import { Button, CircularProgress, Container, Typography } from '@mui/material';
import { FileWithPath } from 'react-dropzone';

import Dropzone from "@/components/dropzone";
import FileList from "@/components/filelist";
import ValidationTable from "@/components/validationtable";
import {Plot} from "@/config/site";
import {useSession} from "next-auth/react";
import {title} from "@/components/primitives";
import * as React from "react";

interface FileErrors {
	[fileName: string]: { [currentRow: string]: string };
}

interface ValidationPureProps {
	/** true when the upload is done,
	 * false when it's not done.
	 * Also false when upload hasn't started.
	 */
	plot: Plot;
	
	uploadDone: boolean;
	/** true when the upload has started but not done. */
	isUploading: boolean;
	/** Keyed by filename, valued by a dict of errors for each row */
	errorsData: FileErrors;
	/** The files which have been set to be uploaded. */
	acceptedFiles: FileWithPath[];
	/** When an upload action is triggered. */
	handleUpload: () => Promise<void>;
	/** When the files are drag/dropped. */
	handleAcceptedFiles: (acceptedFiles: FileWithPath[]) => void;
}

/**
 * For uploading and validating drag and dropped CSV files.
 */
function ValidationPure({
															 uploadDone,
															 isUploading,
															 errorsData,
															 acceptedFiles,
															 handleUpload,
															 handleAcceptedFiles,
															 plot,
														 }: ValidationPureProps) {
	if (uploadDone) {
		if (Object.keys(errorsData).length === 0) {
			return (
				<Container fixed>
					<Typography variant="h1" mt={2}>
						Successfully uploaded.
					</Typography>
				</Container>
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
					<ValidationTable
						errorMessage={errorsData}
						uploadedData={filesWithErrorsList}
						headers={[
							// @todo: these are hardcoded.
							{ label: 'Tag' },
							{ label: 'Subquadrat' },
							{ label: 'SpCode' },
							{ label: 'DBH' },
							{ label: 'Htmeas' },
							{ label: 'Codes' },
							{ label: 'Comments' },
						]}
					/>
				</>
			);
		}
	}
	
	return (
		<>
			<Container fixed>
				{isUploading && <CircularProgress />}
				<Dropzone onChange={handleAcceptedFiles} />
				{acceptedFiles?.length && <FileList acceptedFiles={acceptedFiles} />}
				{acceptedFiles?.length > 0 && plot.num > 0 && (
					<Button
						disabled={isUploading}
						variant="contained"
						onClick={handleUpload}
					>
						Upload to server
					</Button>
				)}
			</Container>
		</>
	);
}

export default function Validation({ params }: { params: { plotKey: string, plotNum: string } }) {
	const [acceptedFiles, setAcceptedFiles] = useState<FileWithPath[]>([]);
	const [isUploading, setisUploading] = useState(false);
	const [errorsData, setErrorsData] = useState<FileErrors>({});
	const [uploadDone, setUploadDone] = useState(false);
	useSession({
		required: true,
		onUnauthenticated() {
			return (
				<>
					<h3 className={title()}>You must log in to view this page.</h3>
				</>
			);
		},
	});
	if(!params || !params.plotKey || !params.plotNum){
		return (
			<>
				<p>params doesn&apos;t exist OR plotkey doesn&apos;t exist OR plotnum doesn&apos;t exist</p>
			</>
		);
	}
	const currentPlot: Plot = {key: params.plotKey, num: parseInt(params.plotNum)};
	return (
		<ValidationPure
			uploadDone={uploadDone}
			isUploading={isUploading}
			errorsData={errorsData}
			plot={currentPlot}
			acceptedFiles={acceptedFiles}
			handleUpload={async () => {
				const fileToFormData = new FormData();
				let i = 0;
				for (const file of acceptedFiles) {
					fileToFormData.append(`file_${i}`, file);
					i++;
				}
				
				setisUploading(true);
				
				// @todo: wrap this in a try/catch, and set an error state.
				const response = await fetch(`http://localhost:3000/api/upload?plot=${currentPlot.key}`,
					{
						method: "POST",
						body: fileToFormData,
				});
				const data = await response.json();
				setErrorsData(data.errors);
				
				setisUploading(false);
				setUploadDone(true);
			}}
			handleAcceptedFiles={(acceptedFiles: FileWithPath[]) => {
				// @todo: what about rejectedFiles?
				setAcceptedFiles((files) => [...acceptedFiles, ...files]);
			}}
		/>
	);
}