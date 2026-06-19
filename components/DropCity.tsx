"use client";
import {
  ArcRotateCamera,
  Color3,
  Color4,
  Engine,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  MultiMaterial,
  PhotoDome,
  Scene,
  StandardMaterial,
  SubMesh,
  Texture,
  Vector3,
  SceneLoader,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import "@babylonjs/loaders";

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
      scene.clearColor = new Color4(0.05, 0.06, 0.1, 1);
      scene.fogMode = Scene.FOGMODE_NONE;
      scene.fogDensity = 0.92;
      scene.fogColor = new Color3(0.05, 0.06, 0.1);

      const skyDome = new PhotoDome(
        "skyDome",
        "/sky.jpg",
        { resolution: 32, size: 1000 },
        scene,
      );
      skyDome.mesh.infiniteDistance = true;

      const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.5,
        4,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas, true);
      camera.lowerRadiusLimit = 8;
      camera.upperRadiusLimit = 60;
      camera.upperBetaLimit = Math.PI / 2.05;

      const light = new HemisphericLight(
        "light",
        new Vector3(0.3, 1, 0.2),
        scene,
      );
      light.intensity = 0.75;
      light.diffuse = new Color3(0.95, 0.96, 1);
      light.groundColor = new Color3(0.12, 0.13, 0.18);

      const ground = MeshBuilder.CreateGround(
        "ground",
        { width: 100, height: 100 },
        scene,
      );
      const groundMat = new StandardMaterial("groundMat", scene);
      groundMat.diffuseColor = new Color3(0.08, 0.09, 0.12);
      groundMat.specularColor = new Color3(0, 0, 0);
      ground.material = groundMat;

      const roadMat = new StandardMaterial("roadMat", scene);
      roadMat.diffuseColor = new Color3(0.16, 0.16, 0.18);
      roadMat.specularColor = new Color3(0, 0, 0);

      const road1 = MeshBuilder.CreateBox(
        "road1",
        { width: 100, depth: 12, height: 0.2 },
        scene,
      );
      road1.position.y = 0.11;
      road1.material = roadMat;

      const road2 = MeshBuilder.CreateBox(
        "road2",
        { width: 12, depth: 100, height: 0.2 },
        scene,
      );
      road2.position.y = 0.11;
      road2.material = roadMat;

      const buildingTexturePaths = [
        "/building.jpg",
        "/building1.jpg",
        "/building2.jpg",
        "/building3.jpg",
      ];

      const topColor = new Color3(0.5, 0.5, 0.52);

      const buildingMultiMats: MultiMaterial[] = buildingTexturePaths.map(
        (path, i) => {
          const sideMat = new StandardMaterial(`buildingSideMat_${i}`, scene);
          const tex = new Texture(path, scene);
          tex.uScale = 1;
          tex.vScale = 1;
          sideMat.diffuseTexture = tex;
          sideMat.specularColor = new Color3(0.05, 0.05, 0.05);

          const topMat = new StandardMaterial(`buildingTopMat_${i}`, scene);
          topMat.diffuseColor = topColor;
          topMat.specularColor = new Color3(0.05, 0.05, 0.05);

          const multiMat = new MultiMaterial(`buildingMultiMat_${i}`, scene);
          multiMat.subMaterials.push(sideMat);
          multiMat.subMaterials.push(topMat);
          return multiMat;
        },
      );

      const applyBuildingMaterial = (box: Mesh, multiMat: MultiMaterial) => {
        box.material = multiMat;
        box.subMeshes = [];
        const verticesCount = box.getTotalVertices();
        const indicesPerFace = 6;
        for (let face = 0; face < 6; face++) {
          const isTopOrBottom = face === 4 || face === 5;
          new SubMesh(
            isTopOrBottom ? 1 : 0,
            0,
            verticesCount,
            face * indicesPerFace,
            indicesPerFace,
            box,
          );
        }
      };

      const size = 100;
      const spacing = 7;

      const buildingColliders: {
        x: number;
        z: number;
        hw: number;
        hd: number;
        h: number;
      }[] = [];

      for (let x = -size / 2; x < size / 2; x += spacing) {
        for (let z = -size / 2; z < size / 2; z += spacing) {
          if (Math.abs(x) < 6 || Math.abs(z) < 6) continue;

          const h = 5 + Math.random() * 18;
          const building = MeshBuilder.CreateBox(
            `b_${x}_${z}`,
            { width: 5, depth: 5, height: h },
            scene,
          );
          building.position = new Vector3(x, h / 2, z);

          const variant =
            buildingMultiMats[
              Math.floor(Math.random() * buildingMultiMats.length)
            ];
          applyBuildingMaterial(building, variant);
          buildingColliders.push({ x, z, hw: 2.8, hd: 2.8, h });
        }
      }

      const droneRoot = MeshBuilder.CreateBox(
        "droneRoot",
        { size: 0.2 },
        scene,
      );
      droneRoot.isVisible = false;
      droneRoot.position = new Vector3(0, 5, 0);

      SceneLoader.ImportMesh("", "/", "drone.glb", scene, (meshes) => {
        const droneModel = meshes[0];
        droneModel.parent = droneRoot;
        droneModel.position = Vector3.Zero();
        droneModel.rotation = Vector3.Zero();
        droneModel.scaling = new Vector3(0.05, 0.05, 0.05);
      });

      // const body = MeshBuilder.CreateBox(
      //   "body",
      //   { width: 1.5, height: 0.3, depth: 1.5 },
      //   scene,
      // );
      // body.parent = droneRoot;
      // const bodyMat = new StandardMaterial("bodyMat", scene);
      // bodyMat.diffuseColor = new Color3(0.85, 0.87, 0.9);
      // bodyMat.specularColor = new Color3(0.3, 0.3, 0.3);
      // body.material = bodyMat;

      // const indicator = MeshBuilder.CreateBox(
      //   "indicator",
      //   { width: 0.15, height: 0.15, depth: 0.9 },
      //   scene,
      // );
      // indicator.parent = droneRoot;
      // indicator.position = new Vector3(0, 0.05, 1.1);
      // const indicatorMat = new StandardMaterial("indicatorMat", scene);
      // indicatorMat.diffuseColor = new Color3(1, 0.25, 0.2);
      // indicatorMat.emissiveColor = new Color3(0.6, 0.1, 0.05);
      // indicator.material = indicatorMat;

      const keys: Record<string, boolean> = {
        w: false,
        s: false,
        a: false,
        d: false,
        space: false,
        shift: false,
      };

      const onKeyDown = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === " " || key === "arrowup" || key === "arrowdown")
          e.preventDefault();
        if (key === " ") keys.space = true;
        if (key === "shift") keys.shift = true;
        if (key === "w") keys.w = true;
        if (key === "a") keys.a = true;
        if (key === "s") keys.s = true;
        if (key === "d") keys.d = true;
      };
      const onKeyUp = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        if (key === " ") keys.space = false;
        if (key === "shift") keys.shift = false;
        if (key === "w") keys.w = false;
        if (key === "a") keys.a = false;
        if (key === "s") keys.s = false;
        if (key === "d") keys.d = false;
      };
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      const speed = 0.06;
      const turnSpeed = 0.06;
      const friction = 0.92;
      const velocity = new Vector3(0, 0, 0);

      engine.runRenderLoop(() => {
        const forward = new Vector3(
          Math.sin(droneRoot.rotation.y),
          0,
          Math.cos(droneRoot.rotation.y),
        );

        if (keys.w) velocity.addInPlace(forward.scale(speed));
        if (keys.s) velocity.addInPlace(forward.scale(-speed));
        if (keys.space) velocity.y -= speed;
        if (keys.shift) velocity.y += speed;
        if (keys.a) droneRoot.rotation.y -= turnSpeed;
        if (keys.d) droneRoot.rotation.y += turnSpeed;

        let targetRotX = 0;
        let targetRotZ = 0;
        if (keys.w) targetRotX = -0.5;
        if (keys.s) targetRotX = 0.5;
        if (keys.a) targetRotZ = 0.5;
        if (keys.d) targetRotZ = -0.5;

        droneRoot.rotation.x += (targetRotX - droneRoot.rotation.x) * 0.1;
        droneRoot.rotation.z += (targetRotZ - droneRoot.rotation.z) * 0.1;

        droneRoot.position.addInPlace(velocity);
        velocity.scaleInPlace(friction);

        const dp = droneRoot.position;
        if (dp.y < 0.5) {
          dp.y = 0.5;
          velocity.y = 0;
        }

        for (const b of buildingColliders) {
          const ox = dp.x - b.x;
          const oz = dp.z - b.z;
          const withinFootprint =
            Math.abs(ox) < b.hw && Math.abs(oz) < b.hd;

    
          const roofClearance = 0.5; 
          const approachWindow = 1.2;
          const withinRoofFootprint =
            Math.abs(ox) < b.hw + 0.3 && Math.abs(oz) < b.hd + 0.3;

          if (
            withinRoofFootprint &&
            dp.y <= b.h + approachWindow &&
            dp.y >= b.h - approachWindow &&
            velocity.y <= 0  
          ) {
            dp.y = b.h + roofClearance;
            velocity.y = 0;
            continue; 
          }


          if (withinFootprint && dp.y < b.h) {
            const px = b.hw - Math.abs(ox);
            const pz = b.hd - Math.abs(oz);
            if (px < pz) {
              dp.x += px * Math.sign(ox);
              velocity.x = 0;
            } else {
              dp.z += pz * Math.sign(oz);
              velocity.z = 0;
            }
          }
        }
        // ────────────────────────────────────────────────────────────────

        camera.target.copyFrom(droneRoot.position);
        const desiredAlpha = -droneRoot.rotation.y - Math.PI / 2;
        let diff = desiredAlpha - camera.alpha;
        diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
        camera.alpha += diff * 0.08;

        scene.render();
      });

      const onResize = () => engine.resize();
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("keydown", onKeyDown);
        window.removeEventListener("keyup", onKeyUp);
        window.removeEventListener("resize", onResize);
      };
    };

    const cleanup = init();

    return () => {
      cleanup?.();
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