"use client"
import { ArcRotateCamera, Engine, HemisphericLight, MeshBuilder, Scene, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";

export default function DropCity() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    let engine: Engine;
    let scene: Scene;
    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      engine = new Engine(canvas, true);
      scene = new Scene(engine);

      const havokInstance = await HavokPhysics();
      const physicsPlugin = new HavokPlugin(true, havokInstance);
      scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

      const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.5,
        100,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas, true);

      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.8;

      const ground=MeshBuilder.CreateGround("ground",{
        width:100,
        height:100,
      },
    scene)

    const road1=MeshBuilder.CreateBox("road1",{
      width:100,
      depth:10,
      height:0.1,

    },scene)
    road1.position.y=0.05
    const road1Mat=new StandardMaterial("road1Mat",scene)
    road1Mat.diffuseTexture=new Texture("/road1.jpg",scene)
    road1.material=road1Mat
    

    const road2=MeshBuilder.CreateBox("road2",{
      width:10,
      depth:100,
      height:0.1
    },scene)
    road2.position.y=0.1
    const road2Mat=new StandardMaterial("road2Mat",scene)
    road2Mat.diffuseTexture=new Texture("/road.jpg",scene)
    road2.material=road2Mat

    engine.runRenderLoop(() => scene.render());
    window.addEventListener("resize", () => engine.resize());
    };
    init()
  }, []);
  return (
    <canvas ref={canvasRef} style={{ width: "100%", height: "100vh" }}></canvas>
  );
}
