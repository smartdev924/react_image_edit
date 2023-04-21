import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import { Box } from "@mui/system";
import {
  FormControlLabel,
  Grid,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import { AiOutlineClose } from "react-icons/ai";
import { tools } from "@/state/utils";
import { useParams } from "react-router-dom";
import { useStore } from "@/state/store";

const predefinedSizes = [
  "200x300",
  "400x600",
  "600x900",
  "800x1200",
  "1000x1500",
];

const socialButton = [
  {
    name: "YouTube",
    size: [1280, 720],
  },
  {
    name: "Instagram",
    size: [1080, 1080],
  },
  {
    name: "Facebook",
    size: [1200, 630],
  },
];

const fileTypes = ["JPEG", "PNG", "JPG"];

export const ModalSection = () => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("Jpeg");
  const [rect, setRect] = useState([0, 0]);
  const { width, height } = useStore((s) => s.original);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const { id } = useParams();

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <button
        className="px-5 py-2 rounded-md bg-pink-500 text-sm text-white"
        onClick={handleClickOpen}
      >
        Download File
      </button>
      <Dialog
        open={open}
        maxWidth={"sm"}
        onClose={handleClose}
        aria-labelledby="modal Section"
        aria-describedby="modal section"
        sx={{ zIndex: 10000 }}
      >
        <DialogContent>
          <Box sx={{ textAlign: "right" }}>
            <IconButton aria-label="close" onClick={handleClose}>
              <AiOutlineClose />
            </IconButton>
          </Box>
          <Grid container rowSpacing={4} columnSpacing={4}>
            <Grid item xs={12}>
              <h3 className="text-xl font-bold mb-4">Predefined Size</h3>
              <Grid container rowSpacing={2} columnSpacing={2}>
                {predefinedSizes.map((data, index) => (
                  <Grid item key={index} xs={4} sm={2.4} md={2}>
                    <div
                      onClick={() => {
                        setRect(data.split("x").map(Number));
                      }}
                      className={`aspect-square cursor-pointer hover:border-gray-800 transition-colors border ${
                        rect[0] === +data.split("x")[0] &&
                        rect[1] === +data.split("x")[1] &&
                        "border-pink-500"
                      } rounded flex justify-center items-center text-sm`}
                    >
                      {data}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <h3 className="text-xl font-bold mb-4">Predefined Size</h3>
              <Grid container rowSpacing={2} columnSpacing={2}>
                {socialButton.map((data, index) => (
                  <Grid key={index} item xs={4} sm={2.4} md={2}>
                    <div
                      onClick={() => {
                        setRect(data.size);
                      }}
                      className={`aspect-square cursor-pointer hover:border-gray-800 transition-colors border ${
                        rect[0] === data.size[0] &&
                        rect[1] === data.size[1] &&
                        "border-pink-500"
                      } rounded flex justify-center items-center text-sm`}
                    >
                      {data.name}
                    </div>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <h3 className="text-xl font-bold mb-4">Recommended Size</h3>
              <div className="flex gap-5">
                <TextField
                  id="width"
                  label="Width"
                  type="number"
                  variant="outlined"
                  defaultValue={width}
                  onChange={(e) => {
                    // @ts-ignore
                    setRect((r) => [e.target.valueAsNumber, r[1]]);
                  }}
                />
                <TextField
                  id="height"
                  label="Height"
                  type="number"
                  variant="outlined"
                  defaultValue={height}
                  onChange={(e) => {
                    // @ts-ignore
                    setRect((r) => [r[0], e.target.valueAsNumber]);
                  }}
                />
              </div>
            </Grid>
            <Grid item xs={12}>
              <h3 className="text-xl font-bold mb-4">File Type</h3>
              <RadioGroup
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                }}
                row
                aria-labelledby="fileTpye"
                name="fileType"
              >
                {fileTypes.map((data, index) => (
                  <FormControlLabel
                    key={index}
                    value={data}
                    control={<Radio />}
                    label={data}
                  />
                ))}
              </RadioGroup>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <button
                onClick={() => {
                  tools().export.saveWithWidthAndHeight(
                    `${id}-${rect[0]}x${rect[1]}`,
                    format,
                    1,
                    rect[0],
                    rect[1]
                  );
                }}
                className="px-5 py-2 rounded-md bg-pink-500 text-sm text-white"
              >
                Download
              </button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </div>
  );
};
