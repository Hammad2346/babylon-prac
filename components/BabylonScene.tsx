"use client";

import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  MeshBuilder,
  Vector3,
  StandardMaterial,
} from "@babylonjs/core";

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      scene,
    );

    camera.attachControl(canvas, true);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);

    light.intensity = 0.7;

    // const ground = MeshBuilder.CreateGround(
    //   "ground",
    //   {
    //     height: 10,
    //     width: 10,
    //     subdivisions: 10,
    //   },
    //   scene,
    // );
    // const groundMat = new StandardMaterial("groundMat", scene);
    // ground.material = groundMat;
    // groundMat.wireframe = true;

const groundFromHM = MeshBuilder.CreateGroundFromHeightMap(
  "ground",
  "/hightmap.png",
  {
    width: 10,
    height: 10,
    subdivisions: 20,
    minHeight: 0,
    maxHeight: 2,
  },
  scene
);
const groundMat =new StandardMaterial("groundMat",scene)
groundFromHM.material= groundMat
groundMat.wireframe=true



    const box = MeshBuilder.CreateBox("box", { size: 2 }, scene);
    box.position.y = 1;

    engine.runRenderLoop(() => {
      scene.render();
    });

    const resize = () => engine.resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      scene.dispose();
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100vh", display: "block" }}
    />
  );
}
