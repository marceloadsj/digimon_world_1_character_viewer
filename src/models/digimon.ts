import * as THREE from "three";

import { TMDToThreeJS } from "../roblouie_tmd/src/threejs-converters/tmd-to-threejs";

import { Artboard } from "./artboard";
import { Info } from "./info";
import {
  newSkeletonPointer,
  FIRST_SKELETON_POINTER,
} from "../structs/skeleton_pointer";
import { NodeStructData, newNodeStructs } from "../structs/node_struct";
import { newMmd, Mmd } from "../structs/mmd";
import { Animation } from "../structs/mmd/animation";
import { PostureStructData } from "../structs/mmd/animation/posture_struct";
import {
  ANIMATION_PROPERTIES,
  ANIMATION_PROPERTY_AXIS,
} from "../structs/mmd/animation/sequences/keyframe";
import {
  ANIMATION_CLAMP_IDLE,
  ANIMATION_CLAMP_POSE,
  ANIMATION_SEQUENCE_FIXES,
} from "../data/fixes";
import { PSX_MEMORY_SPACE_POINTER } from "../constants";

const ANIMATION_TIME_SCALE = 1000 / 60;
const ANIMATION_FADE_IN = 0.2;

const tMDToThreeJS = new TMDToThreeJS();

export class Digimon extends EventTarget {
  private artboard: Artboard;

  previousAnimationIndex: number | null;
  animationIndex: number;

  // Information extracted from the data files
  info: Info;

  private skeletonPointer: number;
  private nodeStructs: Array<NodeStructData>;

  private mmd: Mmd;

  // Three.js objects used to display the digimon on the screen
  private meshes: Array<THREE.Mesh>;
  private skeleton: Array<THREE.Object3D>;

  // Info related to animations
  private animationMixers: Array<THREE.AnimationMixer>;

  animations: Array<{
    poseAnimation: {
      animationActions: Array<THREE.AnimationAction>;
    };
    axisAnimations: Array<{
      repetitions: number | null;
      animationActions: Array<THREE.AnimationAction>;
    }>;
    textureAnimations: {
      loops: Array<{ sequenceIndex: number; repetitions: number } | null>;
      animations: Array<{
        materials: Array<THREE.Material>;
        animationAction: THREE.AnimationAction;
      }>;
    };
  } | null>;

  private animationPoseTimeout: NodeJS.Timeout | null = null;
  private axisAnimationMixerEventListener:
    | ((event: THREE.Event) => void)
    | null = null;
  private textureAnimationMixerEventListener:
    | ((event: THREE.Event) => void)
    | null = null;

  constructor({
    artboard,
    index,
    animationIndex,
  }: {
    artboard: Artboard;
    index: number;
    animationIndex: number;
  }) {
    super();

    // The order of initialization is important as some fields depends on others
    this.artboard = artboard;

    this.info = new Info({ index });

    this.skeletonPointer = newSkeletonPointer(this.info.index);
    this.nodeStructs = newNodeStructs(
      // Compute the correct start offset with psx memory space and considering the first skeleton pointer as zero
      this.skeletonPointer - PSX_MEMORY_SPACE_POINTER - FIRST_SKELETON_POINTER,
      this.info.digimonStruct.numberOfNodes,
    );

    this.mmd = newMmd(this.info.index, this.info.digimonStruct.numberOfNodes);

    this.meshes = tMDToThreeJS.convertWithTMDAndTIM(this.mmd.tmd, [
      this.info.tim,
    ]);

    this.skeleton = this.newSkeleton();

    this.animationMixers = this.newAnimationMixers();
    this.animations = this.newAnimations();

    this.setArtboard();
    this.setAnimationLoop();

    this.previousAnimationIndex = null;
    this.animationIndex = animationIndex;
    this.playAnimation({ shouldFadeIn: false });
  }

  // Methods to create the necessary objects and data
  private newSkeleton() {
    const skeleton: Array<THREE.Object3D> = [];

    this.nodeStructs.forEach((nodeStruct) => {
      const group =
        nodeStruct.objectIndex > -1
          ? this.meshes[nodeStruct.objectIndex]
          : new THREE.Group();

      skeleton.push(group);
      skeleton[nodeStruct.nodeIndex]?.add(group);
    });

    // Fix scale of the whole object via the root node
    skeleton[0].scale.y = -1;
    skeleton[0].scale.z = -1;

    // We render it late as we want to build the animation first
    this.artboard.add(skeleton[0], { shouldRender: false });

    return skeleton;
  }

  private newAnimationMixers() {
    return this.skeleton.map((node) => new THREE.AnimationMixer(node));
  }

  private newAnimations() {
    return this.mmd.animations.map((animation, index) => {
      if (animation === null) return null;

      return {
        poseAnimation: this.newPoseAnimation(animation, index),
        axisAnimations: this.newAxisAnimations(animation, index),
        textureAnimations: this.newTextureAnimations(animation, index),
      };
    });
  }

  private newPoseAnimation(animation: Animation, animationIndex: number) {
    return {
      animationActions: this.skeleton.map((_node, nodeIndex) => {
        const keyframeTracks: Array<THREE.NumberKeyframeTrack> = [];

        // We ignore the rootNode since pose do not affect it, but we still create animationClip as we use the rootNode for other purposes
        if (nodeIndex > 0) {
          ANIMATION_PROPERTIES.forEach((property) => {
            const postureStruct = animation.pose.postureStructs[nodeIndex - 1];

            // We use 1 as it is the default scale value which might be ommited if hasScale is false
            const value = new THREE.Vector3(1, 1, 1);

            if (property === "scale") {
              // We narrow down the postureStruct using the scaleX param but the hasScale protects the condition
              if (animation.pose.hasScale && "scaleX" in postureStruct) {
                value.x = this.getScale(postureStruct.scaleX);
                value.y = this.getScale(postureStruct.scaleY);
                value.z = this.getScale(postureStruct.scaleZ);
              }
            } else if (property === "rotation") {
              value.x = this.getRotation(postureStruct.rotationX);
              value.y = this.getRotation(postureStruct.rotationY);
              value.z = this.getRotation(postureStruct.rotationZ);
            } else {
              value.x = this.getPosition(postureStruct.positionX);
              value.y = this.getPosition(postureStruct.positionY);
              value.z = this.getPosition(postureStruct.positionZ);
            }

            ANIMATION_PROPERTY_AXIS.forEach((axis) => {
              keyframeTracks.push(
                new THREE.NumberKeyframeTrack(
                  `.${property}[${axis}]`,
                  [0], // The poseAnimation have 1 frame only because it's just the initial position
                  [value[axis]],
                ),
              );
            });
          });
        }

        const animationClip = new THREE.AnimationClip(
          this.getAnimationClipName({
            nodeIndex,
            animationIndex,
            mode: "pose",
          }),
          -1,
          keyframeTracks,
        );

        animationClip.optimize();

        const animationAction =
          this.animationMixers[nodeIndex].clipAction(animationClip);

        animationAction.loop = THREE.LoopOnce;
        animationAction.clampWhenFinished = true;
        animationAction.timeScale = ANIMATION_TIME_SCALE;

        return animationAction;
      }),
    };
  }

  private newAxisAnimations(animation: Animation, animationIndex: number) {
    const axisAnimations: Array<{
      numberOfSequences: number;
      repetitions: number | null;
      animationActions: Array<THREE.AnimationAction>;
    }> = [
      {
        numberOfSequences: animation.pose.numberOfSequences,
        repetitions: null,
        animationActions: [],
      },
    ];

    const parsedKeyframes: Record<
      // The axisAnimationIndex
      number,
      Record<
        // The nodeIndex
        number,
        {
          [key in (typeof ANIMATION_PROPERTIES)[number]]?: {
            [key in (typeof ANIMATION_PROPERTY_AXIS)[number]]?: {
              durations: Array<number>;
              values: Array<number>;
            };
          };
        }
      >
    > = {};

    animation.sequences.forEach((sequence, index) => {
      const axisAnimationIndex = axisAnimations.length - 1;

      if (sequence.opcode === 0) {
        sequence.keyframes.forEach((keyframe, keyframeIndex) => {
          const fixedValue = this.getFixedAxisAnimationValue(
            animationIndex,
            index,
            keyframeIndex,
          );

          // In order to create the animations correctly, we first structure the data in what we call parsedKeyframes
          parsedKeyframes[axisAnimationIndex] ??= {};
          parsedKeyframes[axisAnimationIndex][keyframe.nodeIndex] ??= {};

          const parsedKeyframe =
            parsedKeyframes[axisAnimationIndex][keyframe.nodeIndex];

          // Note that even when we have missing values, we still add 0 so the keyframes can run on the correct time
          ANIMATION_PROPERTIES.forEach((property) => {
            if (property === "scale") {
              // The values we collect here works based on addition, that's why scale, when missing, should be zero
              parsedKeyframe.scale ??= {
                x: { durations: [], values: [] },
                y: { durations: [], values: [] },
                z: { durations: [], values: [] },
              };

              parsedKeyframe.scale?.x?.durations.push(keyframe.duration);
              parsedKeyframe.scale?.x?.values.push(
                keyframe.hasScaleX
                  ? this.getFixedScale(fixedValue.scaleX, keyframe.scaleX)
                  : 0,
              );

              parsedKeyframe.scale.y?.durations.push(keyframe.duration);
              parsedKeyframe.scale.y?.values.push(
                keyframe.hasScaleY
                  ? this.getFixedScale(fixedValue.scaleY, keyframe.scaleY)
                  : 0,
              );

              parsedKeyframe.scale.z?.durations.push(keyframe.duration);
              parsedKeyframe.scale.z?.values.push(
                keyframe.hasScaleZ
                  ? this.getFixedScale(fixedValue.scaleZ, keyframe.scaleZ)
                  : 0,
              );
            } else if (property === "rotation") {
              parsedKeyframe.rotation ??= {
                x: { durations: [], values: [] },
                y: { durations: [], values: [] },
                z: { durations: [], values: [] },
              };

              parsedKeyframe.rotation.x?.durations.push(keyframe.duration);
              parsedKeyframe.rotation.x?.values.push(
                this.getFixedRotation(fixedValue.rotationX, keyframe.rotationX),
              );

              parsedKeyframe.rotation.y?.durations.push(keyframe.duration);
              parsedKeyframe.rotation.y?.values.push(
                this.getFixedRotation(fixedValue.rotationY, keyframe.rotationY),
              );

              parsedKeyframe.rotation.z?.durations.push(keyframe.duration);
              parsedKeyframe.rotation.z?.values.push(
                this.getFixedRotation(fixedValue.rotationZ, keyframe.rotationZ),
              );
            } else {
              parsedKeyframe.position ??= {
                x: { durations: [], values: [] },
                y: { durations: [], values: [] },
                z: { durations: [], values: [] },
              };

              parsedKeyframe.position.x?.durations.push(keyframe.duration);
              parsedKeyframe.position.x?.values.push(
                this.getFixedPosition(fixedValue.positionX, keyframe.positionX),
              );

              parsedKeyframe.position.y?.durations.push(keyframe.duration);
              parsedKeyframe.position.y?.values.push(
                this.getFixedPosition(fixedValue.positionY, keyframe.positionY),
              );

              parsedKeyframe.position.z?.durations.push(keyframe.duration);
              parsedKeyframe.position.z?.values.push(
                this.getFixedPosition(fixedValue.positionZ, keyframe.positionZ),
              );
            }
          });
        });
      } else if (sequence.opcode === 1) {
        // The next sequence after a loopStartSequence always contain the sequenceIndex that represents the loop start
        const nextSequence = animation.sequences[index + 1];

        axisAnimations[axisAnimationIndex].numberOfSequences =
          nextSequence.opcode === 0
            ? // We decrease by 1 here because this is the previous axisAnimations, which, ofc, ends up before the new one
              nextSequence.sequenceIndex - 1
            : animation.pose.numberOfSequences;

        axisAnimations.push({
          // The numberOfSequences will be set during the loop end
          numberOfSequences: 0,
          repetitions: sequence.repetitions,
          animationActions: [],
        });
      } else if (sequence.opcode === 2) {
        // From what I checked, we always have start and end in sequence, we never encounter two starts (nested loops)
        axisAnimations[axisAnimationIndex].numberOfSequences =
          sequence.sequenceIndex - sequence.startSequenceIndex;

        axisAnimations.push({
          // For now, use the remaining numberOfSequences, but this might get updated if another loop exists
          numberOfSequences:
            animation.pose.numberOfSequences - sequence.sequenceIndex,
          repetitions: null,
          animationActions: [],
        });
      }
    });

    Object.entries(parsedKeyframes)
      .map(
        ([axisAnimationIndex, axisKeyframes]) =>
          [Number(axisAnimationIndex), axisKeyframes] as const,
      )
      .forEach(([axisAnimationIndex, axisKeyframes]) => {
        // Here we create an animationClip on rootNode just to guide us during the looping process
        const keyframeTracks = [
          new THREE.NumberKeyframeTrack(
            ".scale[x]",
            [0, axisAnimations[axisAnimationIndex].numberOfSequences],
            // Note that here we use scale, but with both values as 1, so no visual impact happens
            [1, 1],
          ),
        ];

        // With an animationClip on rootNode, we control the animations and looping correctly
        const animationClip = new THREE.AnimationClip(
          this.getAnimationClipName({
            nodeIndex: 0,
            animationIndex,
            axisAnimationIndex,
          }),
          -1,
          keyframeTracks,
        );

        animationClip.optimize();

        const animationAction =
          this.rootAnimationMixer.clipAction(animationClip);

        animationAction.loop = THREE.LoopOnce;
        animationAction.timeScale = ANIMATION_TIME_SCALE;

        axisAnimations[axisAnimationIndex]?.animationActions.push(
          animationAction,
        );

        Object.entries(axisKeyframes)
          .map(
            ([nodeIndex, parsedKeyframe]) =>
              [Number(nodeIndex), parsedKeyframe] as const,
          )
          .forEach(([nodeIndex, parsedKeyframe]) => {
            if (nodeIndex > 0) {
              // Here we parse again the poseStruct so we are able to get the initial position and make the animation additive
              const poseStruct = animation.pose.postureStructs[nodeIndex - 1];

              const keyframeTracks = Object.entries(parsedKeyframe)
                .map(([property, animations]) => {
                  return Object.entries(animations).map(
                    ([axis, { durations, values }]) => {
                      // Create the correct times by using the sum of each duration, for each keyframe
                      let previousDuration = 0;
                      const times = [
                        0,
                        ...durations.map((duration) => {
                          previousDuration += duration;
                          return previousDuration;
                        }),
                      ];

                      // Extract the posture value to be used as initial value
                      const postureKey =
                        `${property}${axis.toUpperCase()}` as keyof PostureStructData;

                      let previousValue: number;

                      if (property === "scale") {
                        previousValue = this.getScale(poseStruct?.[postureKey]);
                      } else if (property === "rotation") {
                        previousValue = this.getRotation(
                          poseStruct?.[postureKey],
                        );
                      } else {
                        previousValue = this.getPosition(
                          poseStruct?.[postureKey],
                        );
                      }

                      // Create the final list of values that take into account the sum of each keyframe
                      const parsedValues = [
                        previousValue,
                        ...values.map((value) => {
                          previousValue += value;
                          return previousValue;
                        }),
                      ];

                      return new THREE.NumberKeyframeTrack(
                        `.${property}[${axis}]`,
                        times,
                        parsedValues,
                      );
                    },
                  );
                })
                .flat();

              // And finally, create each clip of that particular axisAnimation, which might have multiple as there are parts that need looping
              const animationClip = new THREE.AnimationClip(
                this.getAnimationClipName({
                  nodeIndex,
                  animationIndex,
                  axisAnimationIndex,
                }),
                -1,
                keyframeTracks,
              );

              THREE.AnimationUtils.makeClipAdditive(animationClip);
              animationClip.optimize();

              const animationAction =
                this.animationMixers[nodeIndex].clipAction(animationClip);

              animationAction.loop = THREE.LoopOnce;
              animationAction.clampWhenFinished = true;
              animationAction.timeScale = ANIMATION_TIME_SCALE;

              axisAnimations[axisAnimationIndex]?.animationActions.push(
                animationAction,
              );
            }
          });
      });

    return axisAnimations
      .filter(
        (axisAnimation) =>
          axisAnimation !== null && axisAnimation.animationActions.length > 0,
      )
      .map(({ repetitions, animationActions }) => ({
        repetitions,
        animationActions,
      }));
  }

  private newTextureAnimations(animation: Animation, animationIndex: number) {
    const textureAnimations: {
      loops: Array<{ sequenceIndex: number; repetitions: number } | null>;
      animations: Array<{
        materials: Array<THREE.Material>;
        animationAction: THREE.AnimationAction;
      }>;
    } = {
      loops: [],
      animations: [],
    };

    const initialMaterialsSet = new Set<THREE.Material>();

    this.skeleton.forEach((object3d) => {
      if (object3d instanceof THREE.Mesh) {
        [object3d.material].flat().forEach((material) => {
          initialMaterialsSet.add(material);
        });
      }
    });

    const initialMaterials = [...initialMaterialsSet];

    const parsedKeyframes: Array<{
      sequenceIndex: number;
      numberOfSequences: number;
      materials: Array<THREE.Material>;
    }> = [];

    let sequenceIndex: number;
    let repetitions: number;

    animation.sequences.forEach((sequence) => {
      if (sequence.opcode === 1) {
        sequenceIndex = textureAnimations.loops.length;
        repetitions = sequence.repetitions;
      } else if (sequence.opcode === 2) {
        textureAnimations.loops.push({ sequenceIndex, repetitions });

        const numberOfSequences =
          animation.pose.numberOfSequences - sequence.sequenceIndex;

        const parsedKeyframe = parsedKeyframes[parsedKeyframes.length - 1];
        if (parsedKeyframe) {
          parsedKeyframe.numberOfSequences -= numberOfSequences;

          parsedKeyframes.push({ ...parsedKeyframe, numberOfSequences });
          textureAnimations.loops.push(null);
        }
      } else if (sequence.opcode === 3) {
        const parsedKeyframe = parsedKeyframes[parsedKeyframes.length - 1];

        const isSameSequenceIndex = Boolean(
          parsedKeyframe &&
            parsedKeyframe.sequenceIndex === sequence.sequenceIndex,
        );

        const newMaterials = parsedKeyframe
          ? parsedKeyframe.materials
          : initialMaterials;

        const materials = newMaterials.map((material) => {
          if (material instanceof THREE.MeshStandardMaterial) {
            const image = material.map?.image as ImageData | undefined;

            if (image) {
              const newImage = new ImageData(
                new Uint8ClampedArray(image.data),
                image.width,
                image.height,
              );

              for (let h = 0; h < sequence.height; h++) {
                for (let w = 0; w < sequence.width; w++) {
                  const srcIndex =
                    ((sequence.srcY + h) * newImage.width +
                      (sequence.srcX + w)) *
                    4;

                  const destIndex =
                    ((sequence.destY + h) * newImage.width +
                      (sequence.destX + w)) *
                    4;

                  newImage.data[destIndex] = newImage.data[srcIndex];
                  newImage.data[destIndex + 1] = newImage.data[srcIndex + 1];
                  newImage.data[destIndex + 2] = newImage.data[srcIndex + 2];
                  newImage.data[destIndex + 3] = newImage.data[srcIndex + 3];
                }
              }

              const texture = new THREE.DataTexture(
                newImage.data,
                newImage.width,
                newImage.height,
                THREE.RGBAFormat,
              );
              texture.needsUpdate = true;

              return new THREE.MeshStandardMaterial({
                map: texture,
                transparent: material.transparent,
                alphaTest: material.alphaTest,
                opacity: material.opacity,
                side: material.side,
              });
            }
          }

          return material;
        });

        const numberOfSequences =
          animation.pose.numberOfSequences - sequence.sequenceIndex;

        if (isSameSequenceIndex) {
          parsedKeyframe.materials = materials;
        } else {
          textureAnimations.loops.push(null);

          if (parsedKeyframe) {
            parsedKeyframe.numberOfSequences -= numberOfSequences;
          }

          parsedKeyframes.push({
            sequenceIndex: sequence.sequenceIndex,
            numberOfSequences,
            materials,
          });
        }
      }
    });

    Object.values(parsedKeyframes).forEach(
      ({ numberOfSequences, materials }, index) => {
        const keyframeTrack = new THREE.NumberKeyframeTrack(
          `.texture`,
          [0, numberOfSequences],
          [0, 1],
        );

        const animationClip = new THREE.AnimationClip(
          this.getAnimationClipName({
            nodeIndex: -1,
            animationIndex,
            textureAnimationIndex: animationIndex,
            seed: index,
            mode: "texture",
          }),
          -1,
          [keyframeTrack],
        );

        const animationAction =
          this.rootAnimationMixer.clipAction(animationClip);

        animationAction.loop = THREE.LoopOnce;
        animationAction.timeScale = ANIMATION_TIME_SCALE;

        textureAnimations.animations.push({
          materials,
          animationAction,
        });
      },
    );

    return textureAnimations;
  }

  // Methods to help generating or accessing data
  private getAnimationClipName({
    nodeIndex,
    animationIndex = this.animationIndex,
    axisAnimationIndex,
    textureAnimationIndex,
    seed,
    mode = "axis",
  }: {
    nodeIndex?: number;
    animationIndex?: number;
    axisAnimationIndex?: number;
    textureAnimationIndex?: number;
    seed?: number;
    mode?: "axis" | "pose" | "texture";
  }) {
    // Based on the indexes passed as params, we create a unique name for each animationClip
    return [
      nodeIndex ? `node${nodeIndex}` : null,
      `animation${animationIndex}`,
      axisAnimationIndex ? `axisAnimation${axisAnimationIndex}` : null,
      textureAnimationIndex ? `textureAnimation${textureAnimationIndex}` : null,
      seed,
      mode === "axis" ? null : mode,
    ]
      .filter(Boolean)
      .join(".");
  }

  private getScale(value?: number | null) {
    if (value === undefined || value === null) return 1;
    return value / 4096;
  }

  private getFixedScale(fixedValue?: number, value?: number | null) {
    if (fixedValue == undefined) {
      return this.getScale(value);
    }

    return this.getScale(fixedValue);
  }

  private getRotation(value?: number | null) {
    if (value === undefined || value === null) return 0;
    return (value * Math.PI) / 2048;
  }

  private getFixedRotation(fixedValue?: number, value?: number | null) {
    if (fixedValue == undefined) {
      return this.getRotation(value);
    }

    return this.getRotation(fixedValue);
  }

  private getPosition(value?: number | null) {
    if (value === undefined || value === null) return 0;
    return value;
  }

  private getFixedPosition(fixedValue?: number, value?: number | null) {
    if (fixedValue == undefined) {
      return this.getPosition(value);
    }

    return this.getPosition(fixedValue);
  }

  // Public APIs so consumer can interact with the digimon
  get rootNode() {
    return this.skeleton[0];
  }

  get rootAnimationMixer() {
    return this.animationMixers[0];
  }

  remove() {
    this.artboard.remove(this.rootNode);

    this.clearAxisAnimationMixer();
    this.clearTextureAnimationMixer();
    this.clearAnimationPoseTimeout();

    this.animationMixers.forEach((animationMixer) => {
      animationMixer.stopAllAction();
    });

    this.artboard.renderer.setAnimationLoop(null);

    this.meshes.forEach((mesh) => {
      [mesh.material].flat().forEach((material) => {
        material.dispose();

        if (
          material instanceof THREE.MeshStandardMaterial ||
          material instanceof THREE.MeshBasicMaterial
        ) {
          material.map?.dispose();
        }
      });
    });
  }

  addEventListener(
    type: "animationFinished",
    callback: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions | undefined,
  ) {
    super.addEventListener(type, callback, options);
  }

  setAnimationIndex(
    index: number,
    { shouldFadeIn = true }: { shouldFadeIn?: boolean } = {},
  ) {
    if (this.animationIndex !== index) {
      this.previousAnimationIndex = this.animationIndex;
      // If no animation with the index passed exists, use the first one (idle)
      this.animationIndex = this.mmd.animations[index] ? index : 0;

      this.playAnimation({ shouldFadeIn });
    }
  }

  // Private setters for necessary logic
  private getFixedAxisAnimationValue(
    animationIndex: number,
    sequenceIndex: number,
    keyframeIndex: number,
  ) {
    return (
      ANIMATION_SEQUENCE_FIXES[this.info.index]?.[animationIndex]?.[
        sequenceIndex
      ]?.[keyframeIndex] || {}
    );
  }

  private get clampPose() {
    return ANIMATION_CLAMP_POSE[this.info.index]?.includes(this.animationIndex);
  }

  private get clampIdle() {
    return ANIMATION_CLAMP_IDLE[this.info.index]?.[this.animationIndex];
  }

  private setArtboard() {
    // We use some values to divide/multiply and position the camera in a somewhat good angle to all digimons
    this.artboard.camera.position.set(
      0,
      this.info.digimonStruct.height * 3,
      Math.max(this.info.digimonStruct.height * 4, 2500),
    );

    this.artboard.camera.lookAt(0, this.info.digimonStruct.height / 2, 0);
  }

  private setAnimationLoop() {
    const clock = new THREE.Clock();

    this.artboard.renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();

      this.animationMixers.forEach((animationMixer) => {
        animationMixer.update(delta);
      });

      this.artboard.render();
    });
  }

  // Functions to play the animations
  private playAnimation({
    shouldFadeIn = true,
  }: { shouldFadeIn?: boolean } = {}) {
    this.clearAnimationPoseTimeout();
    this.clearAxisAnimationMixer();
    this.clearTextureAnimationMixer();

    this.fadeOutPreviousAnimations({ shouldFadeIn });

    this.playPoseAnimation({ shouldFadeIn }).then(() => {
      this.stopPreviousAnimations();

      const animation = this.animations[this.animationIndex];

      animation?.poseAnimation.animationActions.forEach((animationAction) => {
        animationAction.paused = true;
      });

      this.playAxisAnimation();
      this.playTextureAnimation();
    });
  }

  private playPoseAnimation({
    shouldFadeIn = true,
  }: { shouldFadeIn?: boolean } = {}) {
    const animation = this.animations[this.animationIndex];

    animation?.poseAnimation.animationActions.forEach((animationAction) => {
      animationAction
        .reset()
        .fadeIn(shouldFadeIn ? ANIMATION_FADE_IN : 0)
        .play();
    });

    return new Promise((resolve) => {
      this.animationPoseTimeout = setTimeout(
        resolve,
        shouldFadeIn ? ANIMATION_FADE_IN * 1000 : 0,
      );
    });
  }

  private playAxisAnimation() {
    const animation = this.animations[this.animationIndex];

    if (animation) {
      let index = 0;

      const animate = () => {
        if (animation.axisAnimations[index]) {
          const { repetitions, animationActions } =
            animation.axisAnimations[index];

          index++;

          if (repetitions !== null) {
            animationActions.forEach((animationAction) => {
              animationAction.loop = THREE.LoopRepeat;
              animationAction.repetitions =
                repetitions === 255 ? Infinity : repetitions;
            });
          }

          animationActions.forEach((animationAction) => animationAction.play());
        } else {
          this.clearAxisAnimationMixer();

          this.pausePoseAnimation();
          if (this.clampPose) {
            this.stopAxisAnimation();
          } else {
            this.pauseAxisAnimation();
          }

          this.dispatchEvent(new Event("animationFinished"));

          if (this.clampIdle !== undefined) {
            this.setAnimationIndex(0, { shouldFadeIn: this.clampIdle });
          }
        }
      };

      this.axisAnimationMixerEventListener = (event: THREE.Event) => {
        if (!event?.action?._clip.name.endsWith(".texture")) {
          animate();
        }
      };

      this.rootAnimationMixer.addEventListener(
        "finished",
        this.axisAnimationMixerEventListener,
      );

      animate();
    }
  }

  private playTextureAnimation() {
    const animation = this.animations[this.animationIndex];

    if (animation) {
      const repetitions: Record<number, number> = {};
      let index = 0;

      const animate = () => {
        if (animation.textureAnimations.animations[index]) {
          const { materials, animationAction } =
            animation.textureAnimations.animations[index];

          if (materials.length) {
            this.skeleton.forEach((mesh) => {
              if (mesh instanceof THREE.Mesh) {
                mesh.material = materials;
              }
            });
          }

          index++;

          animationAction.reset().play();
        } else {
          this.clearTextureAnimationMixer();
        }
      };

      this.textureAnimationMixerEventListener = (event: THREE.Event) => {
        if (event.action?._clip.name.endsWith(".texture")) {
          const loop = animation.textureAnimations.loops[index];

          let shouldAnimate = true;

          if (loop) {
            repetitions[loop.sequenceIndex] ??=
              loop.repetitions === 255 ? Infinity : loop.repetitions - 1;

            if (
              loop?.sequenceIndex !== null &&
              repetitions[loop.sequenceIndex] > 0
            ) {
              repetitions[loop.sequenceIndex]--;

              shouldAnimate = index !== loop.sequenceIndex;
              index = loop.sequenceIndex;
            }
          }

          if (shouldAnimate) {
            animate();
          }
        }
      };

      this.rootAnimationMixer.addEventListener(
        "finished",
        this.textureAnimationMixerEventListener,
      );

      animate();
    }
  }

  // Controls the previous animations
  private fadeOutPreviousAnimations({
    shouldFadeIn = true,
  }: { shouldFadeIn?: boolean } = {}) {
    if (this.previousAnimationIndex !== null) {
      const previousAnimation = this.animations[this.previousAnimationIndex];

      previousAnimation?.poseAnimation.animationActions.forEach(
        (animationAction) => {
          animationAction.fadeOut(shouldFadeIn ? ANIMATION_FADE_IN : 0).play();
        },
      );

      previousAnimation?.axisAnimations.forEach((axisAnimation) => {
        axisAnimation.animationActions.forEach((animationAction) => {
          animationAction.fadeOut(shouldFadeIn ? ANIMATION_FADE_IN : 0).play();
        });
      });

      previousAnimation?.textureAnimations.animations.forEach(
        ({ animationAction }) => {
          animationAction.paused = true;
        },
      );
    }
  }

  private stopPreviousAnimations() {
    if (this.previousAnimationIndex !== null) {
      const previousAnimation = this.animations[this.previousAnimationIndex];

      previousAnimation?.poseAnimation.animationActions.forEach(
        (animationAction) => animationAction.stop(),
      );

      previousAnimation?.axisAnimations.forEach((axisAnimation) => {
        axisAnimation.animationActions.forEach((animationAction) => {
          animationAction.stop();
        });
      });

      previousAnimation?.textureAnimations.animations.forEach(
        ({ animationAction }) => {
          animationAction.stop();
        },
      );
    }
  }

  // Controls pose animation
  private clearAnimationPoseTimeout() {
    if (this.animationPoseTimeout !== null) {
      clearTimeout(this.animationPoseTimeout);
    }
  }

  private pausePoseAnimation() {
    const animation = this.animations[this.animationIndex];

    animation?.poseAnimation.animationActions.forEach((animationAction) => {
      animationAction.paused = true;
    });
  }

  // Controls axis animation
  private clearAxisAnimationMixer() {
    if (this.axisAnimationMixerEventListener != null) {
      this.rootAnimationMixer.removeEventListener(
        "finished",
        this.axisAnimationMixerEventListener,
      );
    }
  }

  private pauseAxisAnimation() {
    const animation = this.animations[this.animationIndex];

    animation?.axisAnimations.forEach((axisAnimation) => {
      axisAnimation.animationActions.forEach((animationAction) => {
        animationAction.paused = true;
      });
    });
  }

  private stopAxisAnimation() {
    const animation = this.animations[this.animationIndex];

    animation?.axisAnimations.forEach(({ animationActions }) => {
      animationActions.forEach((animationAction) => {
        animationAction.stop();
      });
    });
  }

  // Controls texture animation
  private clearTextureAnimationMixer() {
    if (this.textureAnimationMixerEventListener != null) {
      this.rootAnimationMixer.removeEventListener(
        "finished",
        this.textureAnimationMixerEventListener,
      );
    }
  }
}
