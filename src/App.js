import {
  BrowserRouter as Router,
  Route,
  Switch,
  useLocation,
} from "react-router-dom";
import { useState, useEffect } from "react";
import MEditor from "./components/MonacoEditor";
import PEditor from "./components/AceEditor";
import MobileTopAppBar from "./components/MobileTopAppBar";
import TopAppBar from "./components/TopAppBar";
import BottomAppBar from "./components/BottomAppBar";

// For Alerts
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

// For Theme
import { ThemeProvider } from "styled-components";
import { GlobalStyles } from "./components/GlobalStyles";
import { lightTheme, darkTheme } from "./components/Themes";

import MediaQuery from "react-responsive";
import axios from "axios";

import { v4 as uuidv4, validate as uuidValidate } from "uuid";

// For Analytics
import ReactGA from "react-ga";
import React from "react";

import TreeView from "@material-ui/lab/TreeView";
import TreeItem from "@material-ui/lab/TreeItem";
import { Grid } from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";

var _ = require("lodash");

function CustomAlert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const get_and_set_systemid = async () => {
  let system_id = localStorage.getItem("stagbin_system_id");
  const valid_system_id = uuidValidate(system_id);
  // console.log("Validated systemid: ", uuidValidate(system_id));
  if (!system_id || !valid_system_id) {
    system_id = uuidv4();
    localStorage.setItem("stagbin_system_id", system_id);
  }
  return system_id;
};

const patch_save = async (
  data,
  id,
  buid,
  base_url,
  setSuccess,
  setSizeWarning,
  setDataEmptyError
) => {
  const headers = { buid };

  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }
  const size = byteCount(data) / (1024 * 1024);
  if (size > 0.4) {
    setSizeWarning(true);
    return;
  }
  if (data.length < 1) {
    setDataEmptyError(true);
    return;
  }

  const res = await axios.patch(
    "https://api.stagbin.tk/dev/content/" + id,
    {
      data,
    },
    { headers }
  );
  if (res.status === 200) {
    navigator.clipboard.writeText(base_url + "/" + res.data.id);
    setSuccess(true);
    console.log("res is", res);
    // console.log(base_url);
    // window.location.href = base_url + "/" + res.data.id;
  } else {
    console.log(res.status);
    console.log(res.data);
  }

  console.log("Edited:\n", data);
};

const post_save = async (
  data,
  id,
  buid,
  base_url,
  setSuccess,
  setSizeWarning,
  setDataEmptyError
) => {
  function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
  }
  const size = byteCount(data) / (1024 * 1024);
  if (size > 0.4) {
    setSizeWarning(true);
    return;
  }
  if (data.length < 1) {
    setDataEmptyError(true);
    return;
  }

  const res = await axios.post("https://api.stagbin.tk/dev/content", {
    data,
    buid,
    id,
  });
  if (res.status === 200) {
    navigator.clipboard.writeText(base_url + "/" + res.data.id);
    setSuccess(true);
    // console.log(base_url);
    console.log("res2 is", res);
    // window.location.href = base_url + "/" + res.data.id;
  } else {
    console.log(res.status);
    console.log(res.data);
  }
};

const findPath = (ob, key, value) => {
  const path = [];
  const keyExists = (obj) => {
    if (!obj || (typeof obj !== "object" && !Array.isArray(obj))) {
      return false;
    } else if (obj.hasOwnProperty(key) && obj[key] === value) {
      return true;
    } else if (Array.isArray(obj)) {
      let parentKey = path.length ? path.pop() : "";

      for (let i = 0; i < obj.length; i++) {
        path.push(`${parentKey}[${i}]`);
        const result = keyExists(obj[i], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    } else {
      for (const k in obj) {
        path.push(k);
        const result = keyExists(obj[k], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    }

    return false;
  };

  keyExists(ob);

  return path.join(".");
};

let ii = 50;

function App() {
  let localTheme = localStorage.getItem("stagbin_theme");
  const base_url = window.location.origin;
  if (base_url === "http://stagbin.tk" || base_url === "https://stagbin.tk") {
    const TRACKING_ID = "UA-195260575-1"; // YOUR_OWN_TRACKING_ID
    ReactGA.initialize(TRACKING_ID);
    ReactGA.pageview(window.location.pathname + window.location.search);
  }
  const [theme, setTheme] = useState(localTheme ? localTheme : "dark");
  const [readOnly, setReadOnly] = useState(false);
  // const [language, setLanguage] = useState();
  const [url, setUrl] = useState("");
  const [data, setData] = useState("");
  const [oldData, setOldData] = useState("");
  const [success, setSuccess] = useState(false);
  const [size_warning, setSizeWarning] = useState(false);
  const [data_empty_error, setDataEmptyError] = useState(false);
  const [isMarkdownView, updateIsMarkdownView] = useState(false);
  const [isSameContentbuid, setIsSameContentbuid] = useState("");
  const [edited, setEdited] = useState(false);
  const [isDiff, setIsDiff] = useState(false);
  const [editorVal, setEditorVal] = useState("");
  const [flag, setFlag] = useState(false);
  const [state, setState] = useState({
    data: {
      id: "root",
      name: "Parent",
      text: "",
      children: [
        {
          id: "1",
          name: "Child - 1",
          text: "",
        },
        {
          id: "3",
          name: "Child - 3",
          text: "TEXT_CH3",
          children: [
            {
              id: "4",
              name: "Child - 4",
              text: "",
            },
          ],
        },
      ],
    },
    pid: 0,
    selected_id: "0",
    selected_code: "",
  });
  const themeToggler = () => {
    theme === "light" ? setTheme("dark") : setTheme("light");
    localStorage.setItem("stagbin_theme", theme === "light" ? "dark" : "light");
  };

  const handleKeyDown = async (event) => {
    let charCode = String.fromCharCode(event.which).toLowerCase();
    if (event.ctrlKey && charCode === "s") {
      event.preventDefault();
      invokeSave();
    }

    // For Mac
    if (event.metaKey && charCode === "s") {
      event.preventDefault();
      console.log("Cmd + S pressed");
      invokeSave();
    }
  };

  const invokeSave = async () => {
    const system_id = await get_and_set_systemid();
    if (edited) {
      patch_save(
        // data,
        JSON.stringify(state),
        url,
        system_id,
        base_url,
        setSuccess,
        setSizeWarning,
        setDataEmptyError
      );
    } else {
      post_save(
        // data,
        JSON.stringify(state),
        url,
        system_id,
        base_url,
        setSuccess,
        setSizeWarning,
        setDataEmptyError
      );
    }
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccess(false);
    setSizeWarning(false);
    setDataEmptyError(false);
  };

  // tree item click
  const onItemClick = (event, value) => {
    // state.selected_id = value;
    setState({ ...state, selected_id: value });

    console.log(
      "🚀 ~ file: bottom-content.js ~ line 142 ~ BottomContent ~ onItemClick",
      value,
      state.selected_id
    );

    let newSelectedPath = findPath(state.data, "id", value);
    newSelectedPath = newSelectedPath === "" ? "" : newSelectedPath + ".text";

    const newCode = _.get(state.data, newSelectedPath);

    setData(newCode || "");
    console.log(
      "🚀 ~ file: App.js ~ line 296 ~ onItemClick ~ newCode",
      newCode,
      "staye is ",
      state,
      "newselected path is",
      newSelectedPath
    );
  };

  const onChange = (newValue) => {
    let newSelectedPath = findPath(state.data, "id", state.selected_id);
    newSelectedPath = newSelectedPath === "" ? "" : newSelectedPath + ".text";

    setState({ ...state, selected_code: newValue });
    setData(newValue);
    _.set(state.data, newSelectedPath, newValue);
  };

  // Add Node Click
  const handleNodeAddClick = (e) => {
    console.log("The handleNodeAddClick was clicked.", state);
    const title = prompt("Enter the title for new node", "sometitle");
    setState({
      ...state,
      data: {
        ...state.data,
        children: [
          ...state.data.children,
          {
            id: ii++,
            name: title,
            children: [],
            text: "",
          },
        ],
      },
    });
  };

  // Delete Node Click

  const handleDeleteNodeClick = (e) => {
    let selectedPath = findPath(state.data, "id", state.selected_id);
    var deepCopy = _.cloneDeep(state.data);
    _.unset(deepCopy, selectedPath);
    setState({
      ...state,
      data: deepCopy,
      selected_id: "root",
      selected_code: "",
    });
  };

  const handleSubNodeAddClick = (e) => {
    let selectedPath = findPath(state.data, "id", state.selected_id);
    const oldChildren = _.get(state.data, selectedPath + ".children") || [];
    const title = prompt("Enter the title for new node", "sometitle");
    _.set(state.data, selectedPath + ".children", [
      ...oldChildren,
      { id: ii++, name: title, text: "" },
    ]);
    setState({
      ...state,
      data: state.data,
    });
  };

  const renderTree = (nodes) => (
    <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
      {Array.isArray(nodes.children)
        ? nodes.children.map((node) => (node ? renderTree(node) : <></>))
        : null}
    </TreeItem>
  );

  let reqData = {};
  const getData = async (
    setFlag,
    state,
    setState,
    id,
    base_url,
    setIsSameContentbuid
  ) => {
    // setLoading(true);
    const headers = {
      buid: localStorage.getItem("stagbin_system_id"),
    };
    const res = await axios
      .get("https://api.stagbin.tk/dev/content/" + id, { headers })
      .catch((err) => {
        // alert("invalid url");
        window.location.href = base_url;
        console.log(err);
      });
    console.log(res);
    if (!res) {
      return;
    }
    if (res.status === 200) {
      reqData = res.data[0];
      console.log(reqData);
      setIsSameContentbuid(reqData.edit);
      // setData(reqData.data);
      console.log("starte is ", state);
      console.log("reqw.data", JSON.parse(reqData.data));

      setState(JSON.parse(reqData.data));
      setFlag(true);
      console.log("starte2 is ", state);
      // setLoading(false);
    }
    if (reqData.url) {
      window.location.href = reqData.data;
    }
  };
  function set_data_if_exists(id) {
    if (id) {
      if (id.indexOf(".") !== -1) {
        let ext = id.split(".").at(-1);
        id = id.split(".")[0];
        switch (ext) {
          case "md":
          case "markdown":
            updateIsMarkdownView(true);
            break;

          default:
            break;
        }
      }
      if (!(!readOnly && edited)) setReadOnly(true);
      setUrl(id);
      if (!edited)
        getData(setFlag, state, setState, id, base_url, setIsSameContentbuid);
    }
  }
  useEffect(() => {
    const currPath = window.location.pathname.substring(1);
    if (currPath !== "/") {
      console.log("idd ", currPath);
      set_data_if_exists(currPath);
    }
  }, [window.location]);

  return (
    <ThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
      <>
        <GlobalStyles />
        <div onKeyDown={handleKeyDown} className="App" style={{}}>
          <Router basename={process.env.PUBLIC_URL}>
            <div>
              {/* <MediaQuery maxWidth={480}>
                <MobileTopAppBar
                  toggle={themeToggler}
                  readOnlyToggle={setReadOnly}
                  base_url={base_url}
                  readOnly={readOnly}
                  curTheme={theme}
                  isEditing={true}
                  url={url}
                  setUrl={setUrl}
                  data={data}
                  setData={setData}
                  oldData={oldData}
                  setOldData={setOldData}
                  invokeSave={invokeSave}
                  isSameContentbuid={isSameContentbuid}
                  setIsSameContentbuid={setIsSameContentbuid}
                  edited={edited}
                  setEdited={setEdited}
                  setReadOnly={setReadOnly}
                />
              </MediaQuery> */}
              <MediaQuery minWidth={480}>
                <TopAppBar
                  toggle={themeToggler}
                  readOnly={readOnly}
                  readOnlyToggle={setReadOnly}
                  base_url={base_url}
                  curTheme={theme}
                  isEditing={true}
                  url={url}
                  setUrl={setUrl}
                  data={data}
                  setData={setData}
                  oldData={oldData}
                  setOldData={setOldData}
                  invokeSave={invokeSave}
                  // language={language}
                  // setLanguage={setLanguage}
                  updateIsMarkdownView={updateIsMarkdownView}
                  isMarkdownView={isMarkdownView}
                  ReactGA={ReactGA}
                  isSameContentbuid={isSameContentbuid}
                  setIsSameContentbuid={setIsSameContentbuid}
                  edited={edited}
                  isDiff={isDiff}
                  setEdited={setEdited}
                  setReadOnly={setReadOnly}
                  setIsDiff={setIsDiff}
                  handleNodeAddClick={handleNodeAddClick}
                  handleDeleteNodeClick={handleDeleteNodeClick}
                  handleSubNodeAddClick={handleSubNodeAddClick}
                />
              </MediaQuery>
            </div>
            <Grid container className="full-xy">
              <Grid item xs={2}>
                <div id="mtree">
                  <TreeView
                    className="asa"
                    style={{ height: "100%" }}
                    defaultCollapseIcon={<ExpandMoreIcon />}
                    defaultExpanded={["root"]}
                    defaultExpandIcon={<ChevronRightIcon />}
                    onNodeSelect={(e, v) => onItemClick(e, v)}
                  >
                    {renderTree(state.data || {})}
                  </TreeView>
                </div>
              </Grid>
              <Grid item xs={10}>
                <Switch>
                  <Route exact path="/">
                    {/* <MediaQuery maxWidth={480}>
                      <PEditor
                        curTheme={theme}
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                        url={url}
                        setUrl={setUrl}
                        data={data}
                        setData={setData}
                        oldData={oldData}
                        setOldData={setOldData}
                        invokeSave={invokeSave}
                        // language={language}
                        // setLanguage={setLanguage}
                        base_url={base_url}
                        updateIsMarkdownView={updateIsMarkdownView}
                        isMarkdownView={isMarkdownView}
                        setIsSameContentbuid={setIsSameContentbuid}
                        edited={edited}
                      />
                    </MediaQuery> */}
                    <MediaQuery minWidth={480}>
                      <MEditor
                        curTheme={theme}
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                        url={url}
                        setUrl={setUrl}
                        data={data}
                        setData={setData}
                        oldData={oldData}
                        setOldData={setOldData}
                        invokeSave={invokeSave}
                        // language={language}
                        // setLanguage={setLanguage}
                        base_url={base_url}
                        updateIsMarkdownView={updateIsMarkdownView}
                        isMarkdownView={isMarkdownView}
                        setIsSameContentbuid={setIsSameContentbuid}
                        edited={edited}
                        isDiff={isDiff}
                        onChange={onChange}
                      />
                    </MediaQuery>
                  </Route>
                  <Route path="/:id">
                    {/* <MediaQuery maxWidth={480}>
                      <PEditor
                        curTheme={theme}
                        readOnly={readOnly}
                        setReadOnly={setReadOnly}
                        url={url}
                        setUrl={setUrl}
                        data={data}
                        setData={setData}
                        oldData={oldData}
                        setOldData={setOldData}
                        // language={language}
                        // setLanguage={setLanguage}
                        base_url={base_url}
                        updateIsMarkdownView={updateIsMarkdownView}
                        isMarkdownView={isMarkdownView}
                        setIsSameContentbuid={setIsSameContentbuid}
                        edited={edited}
                      />
                    </MediaQuery> */}

                    {data !== "" ? (
                      <MediaQuery minWidth={480}>
                        <MEditor
                          curTheme={theme}
                          readOnly={readOnly}
                          setReadOnly={setReadOnly}
                          url={url}
                          setUrl={setUrl}
                          // state={state}
                          // setState={setState}
                          data={data}
                          // setData={setData}
                          oldData={oldData}
                          setOldData={setOldData}
                          // language={language}
                          // setLanguage={setLanguage}
                          base_url={base_url}
                          updateIsMarkdownView={updateIsMarkdownView}
                          isMarkdownView={isMarkdownView}
                          setIsSameContentbuid={setIsSameContentbuid}
                          edited={edited}
                          isDiff={isDiff}
                          // onChange={onChange}
                          setFlag={setFlag}
                        />
                      </MediaQuery>
                    ) : (
                      <></>
                    )}
                  </Route>
                </Switch>
              </Grid>
            </Grid>
            <div>
              <BottomAppBar curTheme={theme} />
            </div>
          </Router>
          <Snackbar
            open={success}
            onClose={handleCloseSnackBar}
            autoHideDuration={3000}
          >
            <CustomAlert onClose={handleCloseSnackBar} severity="success">
              {edited
                ? "Paste edited successfully"
                : "Paste saved successfully"}
            </CustomAlert>
          </Snackbar>
          <Snackbar
            open={size_warning}
            onClose={handleCloseSnackBar}
            autoHideDuration={6000}
          >
            <CustomAlert onClose={handleCloseSnackBar} severity="warning">
              Content cannot be more than 400kb (Increased soon)
            </CustomAlert>
          </Snackbar>
          <Snackbar
            open={data_empty_error}
            onClose={handleCloseSnackBar}
            autoHideDuration={6000}
          >
            <CustomAlert onClose={handleCloseSnackBar} severity="Error">
              Content cannot be empty
            </CustomAlert>
          </Snackbar>
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
