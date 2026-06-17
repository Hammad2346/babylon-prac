"use client";
import {
  ArcRotateCamera,
  Color3,
  CubeTexture,
  Engine,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
  Vector4,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";

export default function DropCity() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let engine: Engine;
    let scene: Scene;

    const init = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      engine = new Engine(canvas, true);
      scene = new Scene(engine);
      const envTex = CubeTexture.CreateFromPrefilteredData(
        "https://playground.babylonjs.com/textures/country.env",
        scene,
      );
      scene.environmentTexture = envTex;
      scene.createDefaultSkybox(envTex, true, 1000);

      const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3,
        30,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas, true);

      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 1;
      
      const ground = MeshBuilder.CreateGround(
        "ground",
        { width: 100, height: 100 },
        scene,
      );

      const groundMat = new StandardMaterial("groundMat", scene);
      groundMat.diffuseColor = new Color3(0.15, 0.15, 0.15);
      ground.material = groundMat;
    
      
      const roadMat = new StandardMaterial("roadMat", scene);
      roadMat.diffuseTexture = new Texture("road.jpg",scene);
      
      const road1 = MeshBuilder.CreateBox(
        "road1",
        { width: 100, depth: 12, height: 0.2 },
        scene,
      );
      road1.position.y = 0.2;
      road1.material = roadMat;
      
      const road2 = MeshBuilder.CreateBox(
        "road2",
        { width: 12, depth: 100, height: 0.2 },
        scene,
      );
      road2.position.y = 0.1;
      road2.material = roadMat;

      
      const buildingMat = new StandardMaterial("buildingMat", scene)

      const tex = new Texture("/building.jpg", scene)
      tex.uScale = 1
      tex.vScale = 2

      buildingMat.diffuseTexture = tex
      buildingMat.specularColor = new Color3(0, 0, 0)

      const size = 100;
      const spacing = 7;

      for (let x = -size / 2; x < size / 2; x += spacing) {
        for (let z = -size / 2; z < size / 2; z += spacing) {
          if (Math.abs(x) < 6 || Math.abs(z) < 6) continue;

          const h = 5 + Math.random() * 15;

          const building = MeshBuilder.CreateBox(
  `b_${x}_${z}`,
  {
    width: 5,
    depth: 5,
    height: h,
    faceUV: [
      new Vector4(0, 0, 1, 1), 
      new Vector4(0, 0, 1, 1), 
      new Vector4(0, 0, 1, 1), 
      new Vector4(0, 0, 1, 1), 
      new Vector4(0, 0, 0, 0), 
      new Vector4(0, 0, 0, 0), 
    ],
  },
  scene
)

          building.position = new Vector3(x, h / 2, z);
          building.material = buildingMat;
        }
      }

      

      const droneRoot = MeshBuilder.CreateBox("droneRoot", { size: 1 }, scene);
      droneRoot.isVisible = false;
      droneRoot.position = new Vector3(0, 5, 0);

      const indicator = MeshBuilder.CreateBox(
        "indicator",
        { width: 0.2, height: 0.2, depth: 1 },
        scene,
      );

      const indicatorMat = new StandardMaterial("indicatorMat", scene);
      indicatorMat.diffuseColor = new Color3(1, 0, 0);
      indicator.material = indicatorMat;

      indicator.parent = droneRoot;
      indicator.position = new Vector3(0, 0, 1.2);

      const body = MeshBuilder.CreateBox(
        "body",
        { width: 1.5, height: 0.4, depth: 1.5 },
        scene,
      );
      body.parent = droneRoot;

      const bodyMat = new StandardMaterial("bodyMat", scene);
      bodyMat.diffuseColor = new Color3(0.2, 0.4, 1);
      body.material = bodyMat;
      

      const keys: Record<string, boolean> = {
        w: false,
        s: false,
        d: false,
        a: false,
        space: false,
        shift: false,
      };

      window.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();

        if (key === " " || key === "arrowup" || key === "arrowdown") {
          e.preventDefault();
        }

        if (key === " ") keys.space = true;
        if (key === "shift") keys.shift = true;
        if (key === "w") keys.w = true;
        if (key === "a") keys.a = true;
        if (key === "s") keys.s = true;
        if (key === "d") keys.d = true;
      });
      window.addEventListener("keyup", (e) => {
        const key = e.key.toLowerCase();
        if (key === " ") keys.space = false;
        if (key === "shift") keys.shift = false;
        if (key === "w") keys.w = false;
        if (key === "a") keys.a = false;
        if (key === "s") keys.s = false;
        if (key === "d") keys.d = false;
      });

      const speed = 0.09;
      const velocity = new Vector3(0, 0, 0);
      const friction = 0.92;
      let targetRotX = 0;
      let targetRotZ = 0;

      engine.runRenderLoop(() => {
        const forward = new Vector3(
          Math.sin(droneRoot.rotation.y),
          0,
          Math.cos(droneRoot.rotation.y),
        );

        const speed = 0.09;
        const turnSpeed = 0.03;

        if (keys.w) velocity.addInPlace(forward.scale(speed));
        if (keys.s) velocity.addInPlace(forward.scale(-speed));
        if (keys.space) velocity.addInPlace(new Vector3(0, -0.09, 0));
        if (keys.shift) velocity.addInPlace(new Vector3(0, 0.09, 0));
        if (keys.a) droneRoot.rotation.y += turnSpeed;
        if (keys.d) droneRoot.rotation.y -= turnSpeed;

        targetRotX = 0;
        targetRotZ = 0;

        if (keys.w) targetRotX = -0.5;
        if (keys.s) targetRotX = 0.5;
        if (keys.a) targetRotZ = 0.5;
        if (keys.d) targetRotZ = -0.5;

        droneRoot.rotation.x += (targetRotX - droneRoot.rotation.x) * 0.1;
        droneRoot.rotation.z += (targetRotZ - droneRoot.rotation.z) * 0.1;

        droneRoot.position.addInPlace(velocity);
        velocity.scaleInPlace(friction);

        droneRoot.position.addInPlace(velocity);

        velocity.scaleInPlace(friction);

        scene.render();
        camera.target = Vector3.Lerp(camera.target, droneRoot.position, 0.1);
      });

      window.addEventListener("resize", () => engine.resize());
    };

    init();

    return () => {
      engine?.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100vh", display: "block" }}
    />
  );
}
