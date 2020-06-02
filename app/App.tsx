import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
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

    console.log('press in');
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
        <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut}>
          <View
            style={{
              flex: 1,
              backgroundColor: "transparent",
              flexDirection: "row",
            }}
          ></View>
        </TouchableWithoutFeedback>
      </Camera>

      {pressed && state.currImgSrc !== "" ? (
        <>
          <View pointerEvents="none" style={styles.resultImgView}>
            <Image
              style={styles.resultImg}
              source={{ uri: state.currImgSrc }}
              resizeMode="stretch"
            />
          </View>
        </>
      ) : null}

      {(pressed && state.currImgSrc === "") || pasting ? <ProgressIndicator /> : null}
    </View>
  );
}