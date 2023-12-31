import { headerStruct, HeaderData } from "./structs/header.struct";
import {
  objectTableStruct,
  ObjectTableData,
} from "./structs/object-table.struct";
import { Primitive } from "./primitive";
import { primitiveStruct, PrimitiveData } from "./structs/primitive.struct";
import { normalStruct, NormalData } from "./structs/normal.struct";
import { vertexStruct, VertexData } from "./structs/vertex.struct";

export interface TMDObject {
  primitives: Array<Primitive>;
  vertices: Array<VertexData>;
  normals: Array<NormalData>;
}

export class TMD {
  constructor(arrayBuffer: ArrayBuffer, startOffset = 0) {
    this.header = headerStruct.createObject<HeaderData>(
      arrayBuffer,
      startOffset,
      true,
    );

    this.objectInfos = objectTableStruct.createArray<ObjectTableData>(
      arrayBuffer,
      this.header.nextOffset,
      this.header.numberOfObjects,
      true,
    );

    this.objects = this.objectInfos.map((objectInfo) => {
      const object: TMDObject = {
        primitives: this.getPrimitives(objectInfo, arrayBuffer),
        vertices: vertexStruct.createArray<VertexData>(
          arrayBuffer,
          objectInfo.verticesStart + this.header.nextOffset,
          objectInfo.verticesCount,
          true,
        ),
        normals: normalStruct.createArray<NormalData>(
          arrayBuffer,
          objectInfo.normalsStart + this.header.nextOffset,
          objectInfo.normalsCount,
          true,
        ),
      };

      return object;
    });

    const lastObject = this.objects[this.objects.length - 1];
    const offsetToLastFileEntry =
      lastObject?.normals[lastObject.normals.length - 1].offsetTo.unused;
    this._byteLength = offsetToLastFileEntry + 2 - startOffset; // add byte length of final file entry
  }

  header: HeaderData;
  objectInfos: Array<ObjectTableData>;
  objects: Array<TMDObject>;

  private _byteLength: number;

  get byteLength() {
    return this._byteLength;
  }

  private getPrimitives(object: ObjectTableData, arrayBuffer: ArrayBuffer) {
    const objectPrimitives = [];
    let offset = this.header.nextOffset + object.primitivesStart;

    for (let i = 0; i < object.primitivesCount; i++) {
      const primitiveData = primitiveStruct.createObject<PrimitiveData>(
        arrayBuffer,
        offset,
        true,
      );
      const primitive = new Primitive(arrayBuffer, primitiveData);

      objectPrimitives.push(primitive);
      offset += primitive.totalByteLength;
    }

    return objectPrimitives;
  }
}
