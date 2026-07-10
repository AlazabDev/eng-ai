declare module 'three' {
  export interface MeshStandardMaterialParameters {
    color?: string | number;
    roughness?: number;
    metalness?: number;
  }

  export class MeshStandardMaterial {
    color: unknown;
    roughness: number;
    metalness: number;

    constructor(parameters?: MeshStandardMaterialParameters);
  }

  export class BufferGeometry {}
}

declare module 'three/examples/jsm/loaders/OBJLoader.js' {
  export const OBJLoader: any;
}

declare module 'three/examples/jsm/loaders/STLLoader.js' {
  export const STLLoader: any;
}
