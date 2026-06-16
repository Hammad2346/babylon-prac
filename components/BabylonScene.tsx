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
  PBRMaterial,
  Texture,
  CubeTexture,
  PhysicsBody,
  PhysicsMotionType,
  PhysicsShapeBox,
  PhysicsShapeSphere,
  Quaternion,
} from "@babylonjs/core";

import { HavokPlugin } from "@babylonjs/core/Physics/v2/Plugins/havokPlugin";
import HavokPhysics from "@babylonjs/havok";

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let scene: Scene;
    let engine: Engine;

    const init = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      engine = new Engine(canvas, true);
      scene = new Scene(engine);

      const havokInstance = await HavokPhysics();
      const physicsPlugin = new HavokPlugin(true, havokInstance);
      scene.enablePhysics(new Vector3(0, -9.81, 0), physicsPlugin);

      const envTex = CubeTexture.CreateFromPrefilteredData(
        "https://playground.babylonjs.com/textures/environment.env",
        scene,
      );
      scene.environmentTexture = envTex;
      scene.createDefaultSkybox(envTex, true, 1000);

      const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2.5,
        15,
        Vector3.Zero(),
        scene,
      );
      camera.attachControl(canvas, true);

      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.8;

      const ground = MeshBuilder.CreateBox(
        "ground",
        { width: 20, height: 0.1, depth: 20 },
        scene,
      );
      ground.position.y = -0.05;

      const groundMat = new StandardMaterial("g", scene);
      groundMat.diffuseTexture = new Texture("/table.jpg", scene);
      ground.material = groundMat;

      const groundBody = new PhysicsBody(
        ground,
        PhysicsMotionType.STATIC,
        false,
        scene,
      );
      groundBody.shape = new PhysicsShapeBox(
        Vector3.Zero(),
        Quaternion.Identity(),
        new Vector3(20, 0.1, 20),
        scene,
      );

      const rampAngle = Math.PI / 9;

      const ramp = MeshBuilder.CreateBox(
        "ramp",
        { width: 8, height: 0.2, depth: 20 },
        scene,
      );
      ramp.rotationQuaternion = Quaternion.FromEulerAngles(-rampAngle, 0, 0);
      ramp.position.z = -19;
      ramp.position.y = -3.2;

      const rampMat = new StandardMaterial("rampMat", scene);
      rampMat.diffuseTexture = new Texture("/table.jpg", scene);
      ramp.material = rampMat;

      const rampBody = new PhysicsBody(
        ramp,
        PhysicsMotionType.STATIC,
        false,
        scene,
      );
      rampBody.shape = new PhysicsShapeBox(
        Vector3.Zero(),
        Quaternion.Identity(),
        new Vector3(8, 0.2, 20),
        scene,
      );

      const ramp1Angle = Math.PI;
      const ramp1 = MeshBuilder.CreateBox(
        "ramp1",
        { width: 20, height: 0.2, depth: 20 },
        scene,
      );
      ramp1.rotationQuaternion = Quaternion.FromEulerAngles(-ramp1Angle, 0, 0);
      ramp1.position.z = -35;
      ramp1.position.y = -5.4;

      const ramp1Mat = new StandardMaterial("ramp1Mat", scene);
      ramp1Mat.diffuseTexture = new Texture("/table.jpg", scene);
      ramp1.material = ramp1Mat;

      const ramp1Body = new PhysicsBody(
        ramp1,
        PhysicsMotionType.STATIC,
        false,
        scene,
      );
      ramp1Body.shape = new PhysicsShapeBox(
        Vector3.Zero(),
        Quaternion.Identity(),
        new Vector3(20, 0.2, 20),
        scene,
      );

      const ball = MeshBuilder.CreateSphere("ball", { diameter: 2 }, scene);
      ball.position.y = 5;

      const ballMat = new PBRMaterial("glass", scene);
      ballMat.metallic = 0.0;
      ballMat.roughness = 0.0;
      ballMat.alpha = 0.02;
      ballMat.indexOfRefraction = 1.5;
      ballMat.refractionTexture = envTex;
      ballMat.linkRefractionWithTransparency = true;
      ballMat.environmentIntensity = 2.0;
      ball.material = ballMat;

      const ballBody = new PhysicsBody(
        ball,
        PhysicsMotionType.DYNAMIC,
        false,
        scene,
      );
      ballBody.shape = new PhysicsShapeSphere(Vector3.Zero(), 1, scene);

      ballBody.setMassProperties({
        mass: 2,
        inertia: new Vector3(1, 1, 1),
      });
      ballBody.setLinearDamping(0.5);
      ballBody.setAngularDamping(0.5);

      const keys: Record<string, boolean> = {};

      const onKeyDown = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = true;
      };
      const onKeyUp = (e: KeyboardEvent) => {
        keys[e.key.toLowerCase()] = false;
      };

      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("keyup", onKeyUp);

      scene.onBeforeRenderObservable.add(() => {
        const force = 20;
        const pos = ball.getAbsolutePosition();

        if (keys["w"]) ballBody.applyForce(new Vector3(0, 0, -force), pos);
        if (keys["s"]) ballBody.applyForce(new Vector3(0, 0, force), pos);
        if (keys["a"]) ballBody.applyForce(new Vector3(force, 0, 0), pos);
        if (keys["d"]) ballBody.applyForce(new Vector3(-force, 0, 0), pos);

        camera.target = Vector3.Lerp(camera.target, ball.position, 0.1);
      });

      engine.runRenderLoop(() => scene.render());
      window.addEventListener("resize", () => engine.resize());
    };

    init();

    return () => {
      if (scene) scene.dispose();
      if (engine) engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100vh", display: "block" }}
    />
  );
}
