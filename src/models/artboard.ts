import * as THREE from "three";

export class Artboard {
  renderer: THREE.WebGLRenderer;

  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;

  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;

  floorObject: THREE.Object3D;

  constructor() {
    // The order of creation is important as some fields depends on others
    this.renderer = this.newRenderer();

    this.scene = new THREE.Scene();
    this.camera = this.newCamera();

    this.ambientLight = this.newAmbientLight();
    this.directionalLight = this.newDirectionalLight();

    this.floorObject = this.newFloorObject();

    window.addEventListener("resize", this.resizeRenderer.bind(this));

    this.reset();
  }

  private newRenderer() {
    const renderer = new THREE.WebGLRenderer({ logarithmicDepthBuffer: true });
    renderer.setSize(this.windowWidth, this.windowHeight);
    renderer.setClearColor(0x000000, 0);

    document.body.appendChild(renderer.domElement);

    return renderer;
  }

  private newCamera() {
    return new THREE.PerspectiveCamera(20, this.windowInnerAspect, 1, 7500);
  }

  private newAmbientLight() {
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.5);
    this.scene.add(ambientLight);

    return ambientLight;
  }

  private newDirectionalLight() {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(0, 3, 6);
    directionalLight.lookAt(0, 0, 0);

    this.scene.add(directionalLight);

    return directionalLight;
  }

  private newFloorObject() {
    const floorObject = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: "#52525b" }),
    );

    this.scene.add(floorObject);

    return floorObject;
  }

  get windowInnerAspect() {
    return this.windowWidth / this.windowHeight;
  }

  get windowWidth() {
    return Math.min(window.innerWidth, window.screen.width);
  }

  get windowHeight() {
    return Math.min(window.innerHeight, window.screen.height);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  add(
    object: THREE.Object3D,
    { shouldRender = true }: { shouldRender?: boolean } = {},
  ) {
    this.scene.add(object);
    if (shouldRender) this.render();
  }

  remove(object: THREE.Object3D) {
    this.scene.remove(object);
    this.render();
  }

  resizeRenderer() {
    this.renderer.setSize(this.windowWidth, this.windowHeight);

    this.camera.aspect = this.windowInnerAspect;
    this.camera.updateProjectionMatrix();
  }

  reset() {
    this.floorObject.rotation.x = Math.PI / -2;
    this.floorObject.rotation.z = 0;

    this.floorObject.position.y = -3;
  }
}
