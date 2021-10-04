import React from "react";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { useState } from "react";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Fab from "@material-ui/core/Fab";
import KeyboardArrowUpIcon from "@material-ui/icons/KeyboardArrowUp";
import Zoom from "@material-ui/core/Zoom";
import { Box, Button, ButtonGroup } from "@material-ui/core";
// import { Button } from "react-bootstrap";

import NightsStayIcon from "@material-ui/icons/NightsStay";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/Save";
import EditIcon from "@material-ui/icons/Edit";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import InputAdornment from "@material-ui/core/InputAdornment";
import IconButton from "@material-ui/core/IconButton";
import Input from "@material-ui/core/Input";
import Tooltip from "@material-ui/core/Tooltip";
import { Container, Row } from "react-bootstrap";

import MarkdownIcon from "./icons/MarkdownIcon";
import VSCodeDiffIcon from "./icons/VSCodeDiffIcon";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "fixed",
    bottom: theme.spacing(1),
    right: theme.spacing(2),
    minHeight: "10px",
    zIndex: 99999,
  },
  centerItems: {
    justifyContent: "space-between",
  },
  urlEdit: {
    justifyContent: "center",
    marginLeft: "500px",
    paddingBottom: "15px",
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
    marginTop: "-5px",
    color: "inherit",
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

function ScrollTop(props) {
  const { children, window } = props;
  const classes = useStyles();
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      "#back-to-top-anchor"
    );

    if (anchor) {
      anchor.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        {children}
      </div>
    </Zoom>
  );
}

export default function BackToTop(props) {
  const curTheme = props.curTheme;
  const [icon, setIcon] = useState(curTheme === "dark");
  const [url, setUrl] = [props.url, props.setUrl];
  const readOnly = props.readOnly;
  const classes = useStyles();
  const invokeSave = props.invokeSave;
  const [isMarkdownView, updateIsMarkdownView] = [
    props.isMarkdownView,
    props.updateIsMarkdownView,
  ];
  const isSameContentbuid = props.isSameContentbuid;
  const base_url = props.base_url;

  const setReadOnly = props.setReadOnly;
  const [isDiff, setIsDiff] = [props.isDiff, props.setIsDiff];
  const [edited, setEdited] = [props.edited, props.setEdited];
  const [data, setOldData] = [props.data, props.setOldData];
  //   const [handleNodeAddClick, setHandleNodeAddClick] = [
  //     props.handleNodeAddClick,
  //     props.setHandleNodeAddClick,
  //   ];
  //   const [handleDeleteNodeClick, setHandleDeleteNodeClick] = [
  //     props.handleDeleteNodeClick,
  //     props.setHandleDeleteNodeClick,
  //   ];
  //   const [handleSubNodeAddClick, setHandleSubNodeAddClick] = [
  //     props.handleSubNodeAddClick,
  //     props.setHandleSubNodeAddClick,
  //   ];

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar
        style={{
          background: curTheme === "light" ? "white" : "#363537",
          color: "inherit",
        }}
      >
        <Toolbar className={classes.centerItems}>
          <Typography variant="h6">Pastetree</Typography>
          <FormControl>
            <InputLabel style={{ color: "inherit" }} htmlFor="custom-url">
              URL
            </InputLabel>
            <Input
              id="custom-url"
              type="text"
              disabled={readOnly || edited ? true : false}
              value={url}
              onChange={(e) => {
                // console.log(e.target.value);
                setUrl(e.target.value);
              }}
              style={{ color: "inherit" }}
              endAdornment={
                readOnly ? (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="cop"
                      color="inherit"
                      onClick={() => {
                        navigator.clipboard.writeText(base_url + "/" + url);
                      }}
                    >
                      <FileCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ) : (
                  ""
                )
              }
            />
          </FormControl>
          <div>
            {
              //   <Container fluid>
              // <Row style={{ justifyContent: "right" }}>
              <>
                <ButtonGroup>
                  <Button
                    variant="contained"
                    color="primary"
                    style={{ marginRight: "10px" }}
                    onClick={props.handleNodeAddClick}
                  >
                    Add Node
                  </Button>

                  <Button
                    style={{ marginRight: "10px" }}
                    variant="contained"
                    color="secondary"
                    onClick={props.handleSubNodeAddClick}
                  >
                    Add Subnode
                  </Button>

                  <Button
                    style={{ marginRight: "10px" }}
                    variant="contained"
                    color="error"
                    onClick={props.handleDeleteNodeClick}
                  >
                    Delete Node
                  </Button>
                </ButtonGroup>

                <Button variant="primary">
                  <i className="far fa-save"></i>
                </Button>
                <Button variant="primary">
                  <i className="far fa-edit"></i>
                </Button>
              </>
            }
            {readOnly ? (
              <Tooltip title={"Markdown " + (readOnly ? "View" : "Preview")}>
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="Save"
                  onClick={() => {
                    updateIsMarkdownView(!isMarkdownView);
                  }}
                >
                  <MarkdownIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}
            {edited ? (
              <Tooltip title="View Differences">
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="Difference"
                  onClick={() => {
                    setIsDiff(!isDiff);
                  }}
                >
                  <VSCodeDiffIcon />
                </IconButton>
              </Tooltip>
            ) : (
              ""
            )}
            {readOnly ? (
              isSameContentbuid ? (
                <Tooltip title="Edit">
                  <IconButton
                    edge="end"
                    color="inherit"
                    aria-label="Save"
                    onClick={() => {
                      console.log(data);
                      setOldData((" " + data).slice(1));
                      setEdited(true);
                      setReadOnly(false);
                      console.log(readOnly);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                ""
              )
            ) : (
              <Tooltip title="Save">
                <IconButton
                  edge="end"
                  color="inherit"
                  aria-label="Save"
                  onClick={invokeSave}
                >
                  <SaveIcon />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="New Paste">
              <IconButton
                edge="end"
                color="inherit"
                aria-label="Save"
                onClick={() => {
                  window.location.href = base_url;
                }}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>
            <Button
              color="inherit"
              onClick={() => {
                props.toggle();
                setIcon(!icon);
              }}
            >
              {icon ? <WbSunnyIcon /> : <NightsStayIcon />}
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <ScrollTop {...props}>
        <Fab color="secondary" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </React.Fragment>
  );
}
