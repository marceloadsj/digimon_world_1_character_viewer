// Some animations doesn't look right when they run on 60FPS, or when a smooth transition is applied
// So, this is the place where fix that by tweaking their values, or disabling the transition
type AnimationSequenceFixes = Record<
  number,
  Record<
    number,
    Record<
      number,
      Record<
        number,
        {
          scaleX?: number;
          scaleY?: number;
          scaleZ?: number;
          rotationX?: number;
          rotationY?: number;
          rotationZ?: number;
          positionX?: number;
          positionY?: number;
          positionZ?: number;
        }
      >
    >
  >
>;

const ANIMATION_SEQUENCE_FIXES: AnimationSequenceFixes = {
  // Digimon index
  3: {
    // Animation index
    21: {
      // Sequence index
      13: {
        // Keyframe index
        13: { rotationZ: 2028 },
      },
    },
    44: {
      13: {
        13: { rotationZ: 2028 },
      },
    },
  },
};

const ANIMATION_CLAMP_POSE: Record<number, Array<number>> = {
  // Digimon index with list of Animation indexes
  3: [41],
  10: [5],
};

const ANIMATION_CLAMP_IDLE: Record<number, Record<number, boolean>> = {
  // Digimon index
  3: {
    // Animation index with flag to fade in
    5: false,
    7: false,
    8: false,
    10: false,
    11: false,
    12: true,
    13: false,
    15: false,
    16: false,
    17: false,
    21: false,
    22: false,
    28: false,
    37: false,
    40: false,
    41: false,
    42: false,
    44: false,
    46: false,
    47: false,
    48: false,
    49: false,
    50: false,
    51: false,
    52: true,
    53: false,
  },
};

export { ANIMATION_SEQUENCE_FIXES, ANIMATION_CLAMP_POSE, ANIMATION_CLAMP_IDLE };
