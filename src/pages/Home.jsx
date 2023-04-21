import "@/css/Home.css";
import { state } from "@/state/utils";
import {
  UploadedFile,
  buildUploadInputAccept,
  imgContentTypes,
  stateContentType,
} from "@/tools/import/import-tool";
import deepmerge from "deepmerge";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaFileUpload } from "react-icons/fa";

const fileSizes = ["kb", "mb", "gb", "tb"];
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + fileSizes[i];
};

export default function Home() {
  const onDrop = useCallback(async (files) => {
    if (state().activeTool || state().dirty || !files.length) return;
    const uploadedFile = new UploadedFile(files[0]);
    const src = await uploadedFile.data;
    const id = await state().setEraserMask(src.split(",")[1]);
    window.location.href = `/${id}`;
  }, []);

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: buildUploadInputAccept(
      deepmerge(imgContentTypes(), stateContentType)
    ),
  });
  return (
    <>
      <form className="form-container">
        <div
          {...getRootProps({
            className:
              "z-10 cursor-pointer text-center border border-dashed p-10 rounded shadows",
          })}
          className="upload-files-container"
        >
          <div className="drag-file-area">
            <FaFileUpload className="upload-icon" />
            <h3 className="dynamic-message"> Drag & drop any file here </h3>
            <label
              style={{
                justifyContent: "center",
              }}
              className="label"
            >
              <span className="browse-files">
                <span>or </span>{" "}
                <span className="browse-files-text"> browse file</span>{" "}
                <span>from device</span>
              </span>
              <input
                type="hidden"
                className="default-file-input"
                {...getInputProps()}
              />
            </label>
          </div>
          <div className="file-block">
            <div className="file-info">
              {" "}
              <span className="material-icons-outlined file-icon">
                description
              </span>{" "}
              <span className="file-name">
                {acceptedFiles.length > 0 ? acceptedFiles[0].name : ""}
              </span>{" "}
              |{" "}
              <span className="file-size">
                {acceptedFiles.length > 0
                  ? formatBytes(acceptedFiles[0].size)
                  : ""}
              </span>{" "}
            </div>
          </div>
          <button type="button" className="upload-button">
            {" "}
            Upload{" "}
          </button>
        </div>
      </form>
    </>
  );
}
