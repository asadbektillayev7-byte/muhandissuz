import { useEffect, useRef } from "react";
import * as THREE from "three";

interface Props {
  departmentIndex: number;
  color: string;
}

const scenes = [
  // 0 Mexanika - spinning gear torus
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.8, roughness: 0.2, wireframe: false });
    const torus = new THREE.Mesh(new THREE.TorusGeometry(2, 0.5, 16, 60), mat);
    const torus2 = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.3, 16, 40), new THREE.MeshStandardMaterial({ color: "#c0c0c0", metalness: 0.9, roughness: 0.1 }));
    torus2.rotation.x = Math.PI / 2;
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.4, 32, 32), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.5 }));
    group.add(torus, torus2, sphere);
    scene.add(group);
    return (t: number) => {
      torus.rotation.x = t * 0.5;
      torus.rotation.y = t * 0.8;
      torus2.rotation.z = t * 1.2;
      sphere.position.set(Math.sin(t) * 1.5, Math.cos(t) * 1.5, 0);
    };
  },
  // 1 Fuqarolik - rising buildings
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.3, roughness: 0.7 });
    const heights = [3, 2, 4, 1.5, 3.5];
    heights.forEach((h, i) => {
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.6, h, 0.6), mat);
      box.position.set((i - 2) * 1.2, h / 2 - 2, 0);
      group.add(box);
    });
    scene.add(group);
    let time = 0;
    return (t: number) => {
      time = t;
      group.rotation.y = Math.sin(t * 0.3) * 0.3;
      group.children.forEach((child, i) => {
        child.position.y = (heights[i] / 2 - 2) + Math.sin(t * 0.5 + i) * 0.05;
      });
    };
  },
  // 2 Elektrotexnika - orbiting electrons
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const nucleusMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
    const nucleus = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), nucleusMat);
    group.add(nucleus);
    const rings: THREE.Mesh[] = [];
    [1.5, 2.2, 3].forEach((r, i) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 80), new THREE.MeshStandardMaterial({ color, opacity: 0.5, transparent: true }));
      ring.rotation.x = (i * Math.PI) / 3;
      group.add(ring);
      rings.push(ring);
      const electron = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), new THREE.MeshStandardMaterial({ color: "#ffffff", emissive: "#ffffff", emissiveIntensity: 1 }));
      electron.userData = { radius: r, speed: 1 + i * 0.5, offset: i * 2 };
      group.add(electron);
    });
    scene.add(group);
    return (t: number) => {
      group.rotation.y = t * 0.2;
      group.children.forEach((child) => {
        if (child.userData.radius) {
          const angle = t * child.userData.speed + child.userData.offset;
          child.position.set(Math.cos(angle) * child.userData.radius, Math.sin(angle) * child.userData.radius * 0.3, Math.sin(angle) * child.userData.radius);
        }
      });
    };
  },
  // 3 Dasturiy - floating code cubes
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const size = Math.random() * 0.4 + 0.2;
      const mat = new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? color : "#55e070", wireframe: i % 3 === 0, opacity: 0.8, transparent: true });
      const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
      cube.position.set((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
      cube.userData = { offset: Math.random() * Math.PI * 2, speed: Math.random() * 0.5 + 0.3 };
      group.add(cube);
    }
    scene.add(group);
    return (t: number) => {
      group.rotation.y = t * 0.1;
      group.children.forEach((child) => {
        child.rotation.x = t * child.userData.speed;
        child.rotation.z = t * child.userData.speed * 0.7;
        child.position.y += Math.sin(t + child.userData.offset) * 0.002;
      });
    };
  },
  // 4 Kimyo - molecular structure
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const atoms = [
      { pos: [0, 0, 0], r: 0.5, color },
      { pos: [1.8, 0.5, 0], r: 0.35, color: "#ff6b6b" },
      { pos: [-1.8, 0.5, 0], r: 0.35, color: "#ff6b6b" },
      { pos: [0, -1.8, 0.5], r: 0.3, color: "#6b9fff" },
      { pos: [0.9, 1.5, 1], r: 0.25, color: "#fff" },
    ];
    atoms.forEach((a) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(a.r, 32, 32), new THREE.MeshStandardMaterial({ color: a.color, metalness: 0.3, roughness: 0.4 }));
      mesh.position.set(...(a.pos as [number, number, number]));
      group.add(mesh);
    });
    scene.add(group);
    return (t: number) => {
      group.rotation.y = t * 0.4;
      group.rotation.x = Math.sin(t * 0.3) * 0.3;
    };
  },
  // 5 Kosmik - planet with rings + stars
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const planet = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.8 }));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.3, 8, 100), new THREE.MeshStandardMaterial({ color: "#8899cc", opacity: 0.7, transparent: true }));
    ring.rotation.x = Math.PI / 3;
    const starGeo = new THREE.BufferGeometry();
    const stars = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) stars[i] = (Math.random() - 0.5) * 20;
    starGeo.setAttribute("position", new THREE.BufferAttribute(stars, 3));
    const starField = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: "#ffffff", size: 0.05 }));
    group.add(planet, ring, starField);
    scene.add(group);
    return (t: number) => {
      planet.rotation.y = t * 0.3;
      ring.rotation.z = t * 0.1;
      group.rotation.y = t * 0.05;
    };
  },
  // 6 Atrof-muhit - floating nature sphere
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const earth = new THREE.Mesh(new THREE.SphereGeometry(1.8, 64, 64), new THREE.MeshStandardMaterial({ color, metalness: 0.0, roughness: 0.9 }));
    group.add(earth);
    for (let i = 0; i < 8; i++) {
      const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.5, 8), new THREE.MeshStandardMaterial({ color: "#55cc77" }));
      const angle = (i / 8) * Math.PI * 2;
      leaf.position.set(Math.cos(angle) * 2.2, Math.sin(angle) * 2.2, 0);
      leaf.lookAt(0, 0, 0);
      leaf.userData = { angle, speed: 0.3 + i * 0.05 };
      group.add(leaf);
    }
    scene.add(group);
    return (t: number) => {
      earth.rotation.y = t * 0.2;
      group.children.forEach((child, i) => {
        if (i > 0 && child.userData.angle !== undefined) {
          const a = child.userData.angle + t * child.userData.speed;
          child.position.set(Math.cos(a) * 2.2, Math.sin(a) * 2.2, Math.sin(t + i) * 0.5);
        }
      });
    };
  },
  // 7 Motosport - spinning wheel
  (scene: THREE.Scene, color: string) => {
    const group = new THREE.Group();
    const wheel = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.3, 16, 60), new THREE.MeshStandardMaterial({ color, metalness: 0.9, roughness: 0.1 }));
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.4, 32), new THREE.MeshStandardMaterial({ color: "#888", metalness: 1 }));
    hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) {
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 8), new THREE.MeshStandardMaterial({ color: "#aaa", metalness: 0.8 }));
      spoke.rotation.z = (i / 6) * Math.PI;
      group.add(spoke);
    }
    group.add(wheel, hub);
    const car = new THREE.Mesh(new THREE.BoxGeometry(3, 0.5, 1.2), new THREE.MeshStandardMaterial({ color: "#cc3333", metalness: 0.6, roughness: 0.3 }));
    car.position.set(0, -0.8, 0);
    group.add(car);
    scene.add(group);
    return (t: number) => {
      wheel.rotation.z = t * 2;
      group.children.forEach((child, i) => {
        if (i < 6) child.rotation.z = (i / 6) * Math.PI + t * 2;
      });
      group.rotation.y = Math.sin(t * 0.5) * 0.4;
    };
  },
];

export default function HeroScene({ departmentIndex, color }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;

    const w = mountRef.current.clientWidth;
    const h = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = null;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.set(0, 0, 7);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const point = new THREE.PointLight(color, 3, 20);
    point.position.set(5, 5, 5);
    const point2 = new THREE.PointLight(0xffffff, 1, 20);
    point2.position.set(-5, -3, 3);
    scene.add(ambient, point, point2);

    // Build scene
    const animate = scenes[departmentIndex % scenes.length](scene, color);

    // Loop
    const clock = new THREE.Clock();
    const loop = () => {
      frameRef.current = requestAnimationFrame(loop);
      animate(clock.getElapsedTime());
      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(frameRef.current);
      renderer.dispose();
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [departmentIndex, color]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0"
      style={{ background: "transparent" }}
    />
  );
}
