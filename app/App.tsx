import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

import { Camera } from "expo-camera";

import ProgressIndicator from "./components/ProgressIndicator";

const styles = StyleSheet.create({
  resultImgView: {
    position: "absolute",
    zIndex: 200,
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  resultImg: {
    position: "absolute",
    textAlign: "center",
    fontSize: 50,
    zIndex: 300,
    top: "25%",
    left: 0,
    width: "100%",
    height: "50%",
  },
});

interface State {
  hasPermission: boolean;
  type: any;
  camera: any;
  currImgSrc: string | null;
}

export default function App() {
  const [state, setState] = useState({
    hasPermission: false,
    type: Camera.Constants.Type.back,
    camera: null,
    currImgSrc: "",
  } as State);

  const [pressed, setPressed] = useState(false);
  const [pasting, setPasting] = useState(false);

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
    const resp = await cut();
    setPressed(false);
    console.log('response', resp);
    setState({ ...state, currImgSrc: resp });
    console.log('press in');
  }

  async function cut(): Promise<string> {
    const start = Date.now();
    console.log("");
    console.log("Cut");

    console.log(camera.pictureSize);
    // const ratios = await camera.getSupportedRatiosAsync()
    // console.log(ratios)
    // const sizes = await camera.getAvailablePictureSizeAsync("2:1")
    // console.log(sizes)

    console.log("> taking image...");
    const opts = { skipProcessing: true, exif: false, quality: 0 };
    // const opts = {};
    let photo = await camera.takePictureAsync(opts);

    console.log("> resizing...");
    const { uri } = await ImageManipulator.manipulateAsync(
      photo.uri,
      [
        { resize: { width: 256, height: 512 } },
        { crop: { originX: 0, originY: 128, width: 256, height: 256 } },
      ]
    );

    console.log("> sending to /cut...");
    //const resp = await server.cut(uri);

    console.log(`Done in ${((Date.now() - start) / 1000).toFixed(3)}s`);
    return 'HOLA';
  }

  async function onPressOut() {
    setPressed(false);
    setPasting(true);

    console.log('press out');
  }

  if (state.hasPermission === null) {
    return <View />;
  }
  if (state.hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  let camOpacity = 1;
  if (pressed && state.currImgSrc !== "") {
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
      <>
        <Text>{state.currImgSrc}</Text>
      </>
      {pressed && state.currImgSrc !== "" ? (
        <>
          <Text style={styles.resultImg}>{state.currImgSrc}</Text>
        </>
      ) : null}

      {(pressed && state.currImgSrc === "") || pasting ? <ProgressIndicator /> : null}
    </View>
  );
}