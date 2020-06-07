import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";

import { Camera } from "expo-camera";

import ProgressIndicator from "./components/ProgressIndicator";
import server from "./components/Server";

const styles = StyleSheet.create({
  resultTranslation: {
    color: '#FFFFFF',
    position: "absolute",
    textAlign: "center",
    fontSize: 50,
    zIndex: 300,
    top: "35%",
    left: 0,
    width: "100%",
    height: "50%",
  },
});

const articleColors = {
  der : {
    color: '#00aade'
  },
  die : {
    color: '#d20829'
  },
  das : {
    color : '#04b81a'
  }
};

interface State {
  hasPermission: boolean;
  type: any;
  camera: any;
  article: string | null;
  substantive: string | null;
}

interface  responseServer {
  article : string,
  substantive : string
}

export default function App() {
  const [state, setState] = useState({
    hasPermission: false,
    type: Camera.Constants.Type.back,
    camera: null,
    substantive: "",
    article: "",
  } as State);

  const [pressed, setPressed] = useState(false);

  let camera: any = null;

  useEffect(() => {
    (async () => {
      // Request permission.
      const { status } = await Camera.requestPermissionsAsync();
      const hasPermission = status === "granted" ? true : false;
      setState({ ...state, hasPermission });
    })();
  }, []);

  async function onPressIn() {
    setPressed(true);
    const resp = await translate();
    setState({ ...state, article: resp.article, substantive:  resp.substantive });
  }

  function reset(){
    setPressed(false);
    setState({...state, article : ""});
  }

  async function translate(): Promise<responseServer> {
    const opts = { skipProcessing: true, exif: false, quality: 0 };
    let photo = await camera.takePictureAsync(opts);
    return await server.translate(photo.uri);
  }

  if (state.hasPermission === null) {
    return <View />;
  }
  if (state.hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  let camOpacity = 1;
  if (pressed && state.article !== "") {
    camOpacity = 0.8;
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{ ...StyleSheet.absoluteFillObject, backgroundColor: "black" }}
      ></View>
      <Camera
        style={{ flex: 1, opacity: camOpacity }}
        type={state.type}
        ratio="2:1"
        ref={async (ref) => (camera = ref)}
      >
        <TouchableWithoutFeedback onPressIn={onPressIn}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
            }}
          ></View>
        </TouchableWithoutFeedback>
      </Camera>
      {pressed && state.article !== "" ? (
        <>
          <TouchableWithoutFeedback  onPressIn={reset}>
            <Text style={styles.resultTranslation}>
              <Text style={{backgroundColor: articleColors[state.article].color }}>{state.article}</Text> {state.substantive}
            </Text>
          </TouchableWithoutFeedback>
        </>
      ) : null}
      {(pressed && state.article === "") ? <ProgressIndicator /> : null}
    </View>
  );
}