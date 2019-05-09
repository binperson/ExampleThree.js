import { Box3, Vector3, Vector2, BufferAttribute } from 'three';

// 表示三维空间中的一个方块或立方体。这样做的主要目的是表示对象的最小边界框。
const box = new Box3();

function getSize( object ) {

    box.setFromObject( object );

    return box.getSize(); // 也可以用了获取物体的大小  https://segmentfault.com/a/1190000015169256?utm_source=tag-newest
}

function getCenter( object ) {
    // setFromObject
    // object - Object3D to compute the bounding box of. 对象- Object3D来计算。
    //Computes the world-axis-aligned bounding box of an Object3D (including its children), accounting for the object's, and children's, world transforms. 计算Object3D(包括其子对象)的world-axis对齐的边界框，计算对象的和子对象的world转换。
    box.setFromObject( object );
    // getCenter
    // optionalTarget — (optional) if specified, the result will be copied into this Vector3, otherwise a new Vector3 will be created. 如果指定了optionalTarget(可选)，结果将被复制到这个Vector3中，否则将创建一个新的Vector3
    // Returns the center point of the box as a Vector3. 以向量3的形式返回框的中心点。
    return box.getCenter();
}

function lightsDiff( lights, oldLights ) {

}

function toIndexed( bufferGeometry ) {

    const rawPositions = bufferGeometry.getAttribute( 'position' ).array;

    let rawUvs;
    const hasUV = bufferGeometry.getAttribute( 'uv' ) !== undefined;
    if ( hasUV ) rawUvs = bufferGeometry.getAttribute( 'uv' ).array;

    let rawNormals;
    const hasNormal = bufferGeometry.getAttribute( 'normal' ) !== undefined;
    if ( hasNormal ) rawNormals = bufferGeometry.getAttribute( 'normal' ).array;

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

    let face, faceNormalss, faceUvs, tmpIndices;

    const v0 = new Vector3();
    const v1 = new Vector3();
    const v2 = new Vector3();

    const n0 = new Vector3();
    const n1 = new Vector3();
    const n2 = new Vector3();

    const uv0 = new Vector2();
    const uv1 = new Vector2();
    const uv2 = new Vector2();

    for ( let i = 0; i < rawPositions.length; i += 9 ) {

        v0.x = rawPositions[ i ];
        v0.y = rawPositions[ i + 1 ];
        v0.z = rawPositions[ i + 2 ];

        v1.x = rawPositions[ i + 3 ];
        v1.y = rawPositions[ i + 4 ];
        v1.z = rawPositions[ i + 5 ];

        v2.x = rawPositions[ i + 6 ];
        v2.y = rawPositions[ i + 7 ];
        v2.z = rawPositions[ i + 8 ];

        face = [ v0, v1, v2 ];

        if ( hasNormal ) {

            n0.x = rawNormals[ i ];
            n0.y = rawNormals[ i + 1 ];
            n0.z = rawNormals[ i + 2 ];

            n1.x = rawNormals[ i + 3 ];
            n1.y = rawNormals[ i + 4 ];
            n1.z = rawNormals[ i + 5 ];

            n2.x = rawNormals[ i + 6 ];
            n2.y = rawNormals[ i + 7 ];
            n2.z = rawNormals[ i + 8 ];

            faceNormalss = [ n0, n1, n2 ];

        }

        if ( hasUV ) {

            uv0.x = rawUvs[ i ];
            uv0.y = rawUvs[ i + 1 ];

            uv1.x = rawUvs[ i + 2 ];
            uv1.y = rawUvs[ i + 3 ];

            uv2.x = rawUvs[ i + 4 ];
            uv2.y = rawUvs[ i + 5 ];

            faceUvs = [ uv0, uv1, uv2 ];

        }

        tmpIndices = [];

        face.forEach( function ( v, i ) {

            let id = exists( v, vertices );
            if ( id === -1 ) {

                id = vertices.length;
                vertices.push( v.clone() );

                if ( hasNormal ) normals.push( faceNormalss[ i ].clone() );
                if ( hasUV ) uvs.push( faceUvs[ i ].clone() );

            }
            tmpIndices.push( id );

        } );

        indices.push( tmpIndices[ 0 ], tmpIndices[ 1 ], tmpIndices[ 2 ] );

    }

    const positionBuffer = new Float32Array( vertices.length * 3 );

    let normalBuffer, uvBuffer;

    if ( hasNormal ) normalBuffer = new Float32Array( vertices.length * 3 );
    if ( hasUV ) uvBuffer = new Float32Array( vertices.length * 2 );

    let i2 = 0;
    let i3 = 0;
    for ( let i = 0; i < vertices.length; i++ ) {

        i3 = i * 3;

        positionBuffer[ i3 ] = vertices[ i ].x;
        positionBuffer[ i3 + 1 ] = vertices[ i ].y;
        positionBuffer[ i3 + 2 ] = vertices[ i ].z;

        if ( hasNormal ) {

            normalBuffer[ i3 ] = normals[ i ].x;
            normalBuffer[ i3 + 1 ] = normals[ i ].y;
            normalBuffer[ i3 + 2 ] = normals[ i ].z;

        }

        if ( hasUV ) {

            i2 = i * 2;
            uvBuffer[ i2 ] = uvs[ i ].x;
            uvBuffer[ i2 + 1 ] = uvs[ i ].y;

        }

    }

    bufferGeometry.addAttribute( 'position', new BufferAttribute( positionBuffer, 3 ) );
    if ( hasNormal ) bufferGeometry.addAttribute( 'normal', new BufferAttribute( normalBuffer, 3 ) );
    if ( hasUV ) bufferGeometry.addAttribute( 'uv', new BufferAttribute( uvBuffer, 2 ) );
    bufferGeometry.setIndex( new BufferAttribute( new Uint32Array( indices ), 1 ) );
    return bufferGeometry;

    function exists( v, vertices ) {
        for ( let i = 0; i < vertices.length; i++ ) {
            if ( v.equals( vertices[ i ] ) ) return i;
        }
        return -1;
    }
}

export { getSize, getCenter, toIndexed }
