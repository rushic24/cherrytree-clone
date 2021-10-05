import Editor, { DiffEditor } from "@monaco-editor/react";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";

export default function MEditor(props) {
  const curTheme = props.curTheme;
  const readOnly = props.readOnly;
  const [language, setLanguage] = [props.language, props.setLanguage];
  const setReadOnly = props.setReadOnly;
  const setUrl = props.setUrl;
  const isDiff = props.isDiff;
  const [isMarkdownView, updateIsMarkdownView] = [
    props.isMarkdownView,
    props.updateIsMarkdownView,
  ];
  const [data, setData] = [props.data, props.setData];
  const [state, setState] = [props.state, props.setState];
  const base_url = props.base_url;
  const setIsSameContentbuid = props.setIsSameContentbuid;
  const oldData = props.oldData;
  const edited = props.edited;
  const setFlag = props.setFlag;

  // const [loading, setLoading] = useState(false);
  let { id } = useParams();

  // if (data) {
  //   document.getElementById("m-placeholder").style.display = "none";
  // }
  console.log(oldData);
  const diffEditor = (
    <DiffEditor
      height="90vh"
      defaultLanguage={language}
      original={oldData}
      modified={data}
      theme={curTheme === "light" ? "light" : "vs-dark"}
    />
  );

  const editor = (
    <div
      style={{
        overflow: "hidden",
      }}
    >
      <text
        style={{
          position: "absolute",
          top: "65px",
          marginLeft: "100px",
          zIndex: 2,
          display: data ? "none" : "block",
          pointerEvents: "none",
          opacity: 0.5,
        }}
      >
        Enter text and press ctrl + s to save, this also acts as a url shortner
        if you paste a http(s) url instead
      </text>
      <Editor
        theme={curTheme === "light" ? "light" : "vs-dark"}
        height="88vh"
        // language={language}
        value={data}
        colorDecorators="true"
        options={{
          readOnly: readOnly,
        }}
        // onChange={(value, event) => {
        //   setData(value);
        // }}
        onChange={props.onChange}
      />
    </div>
  );
  const mkeditor = (
    <div
      className="container"
      style={{
        overflow: "hidden",
        paddingBottom: "30px",
      }}
    >
      <MDEditor.Markdown source={data} />
    </div>
  );
  // console.log(language);
  return isDiff ? diffEditor : isMarkdownView ? mkeditor : editor;
}
