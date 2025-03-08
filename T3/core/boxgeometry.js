import * as THREE from '../../build/three.module.js';

const BufferGeometry = THREE.BufferGeometry;
const Float32BufferAttribute = THREE.Float32BufferAttribute;
const Vector3 = THREE.Vector3;


class BoxGeometry extends BufferGeometry {
	static RIGHT = 0x20;
	static LEFT = 0x10;
	static TOP = 0x08;
	static BOTTOM = 0x04;
	static FRONT = 0x02;
	static BACK = 0x01;
	static ALL_SIDES = 0x3F;


	// uvInfo = [[u, v, sizeU, sizeV], ...] (single or array with 6 entries)

	constructor( width = 1, height = 1, depth = 1, sides = 0x3F, widthSegments = 1, heightSegments = 1, depthSegments = 1, uvInfo = undefined) {

		super();

		this.type = 'BoxGeometry';

		this.parameters = {
			width: width,
			height: height,
			depth: depth,
			widthSegments: widthSegments,
			heightSegments: heightSegments,
			depthSegments: depthSegments
		};

		const scope = this;

		// segments

		widthSegments = Math.floor( widthSegments );
		heightSegments = Math.floor( heightSegments );
		depthSegments = Math.floor( depthSegments );

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];
		if (!uvInfo) 
			uvInfo = [0, 0, 1, 1];

		// helper variables

		let numberOfVertices = 0;
		let groupStart = 0;

		// build each side of the box geometry
		(sides & BoxGeometry.RIGHT ) && buildPlane( 'z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0, getUVInfo(2) ); // px
		(sides & BoxGeometry.LEFT  ) && buildPlane( 'z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1, getUVInfo(3) ); // nx
		(sides & BoxGeometry.TOP   ) && buildPlane( 'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2, getUVInfo(0) ); // py
		(sides & BoxGeometry.BOTTOM) && buildPlane( 'x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3, getUVInfo(1) ); // ny
		(sides & BoxGeometry.FRONT ) && buildPlane( 'x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4, getUVInfo(4) ); // pz
		(sides & BoxGeometry.BACK  ) && buildPlane( 'x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5, getUVInfo(5) ); // nz

		// build geometry

		this.setIndex( indices );
		this.setAttribute( 'position', new Float32BufferAttribute( vertices, 3 ) );
		this.setAttribute( 'normal', new Float32BufferAttribute( normals, 3 ) );
		this.setAttribute( 'uv', new Float32BufferAttribute( uvs, 2 ) );

		function getUVInfo(sideId) {
			if (!Array.isArray(uvInfo[0]))
				return uvInfo;

			return sideId < uvInfo.length ? uvInfo[sideId] : uvInfo[uvInfo.length - 1];
		}

		function buildPlane( u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex, uvRange ) {

			const segmentWidth = width / gridX;
			const segmentHeight = height / gridY;

			const widthHalf = width / 2;
			const heightHalf = height / 2;
			const depthHalf = depth / 2;

			const gridX1 = gridX + 1;
			const gridY1 = gridY + 1;

			let vertexCounter = 0;
			let groupCount = 0;

			const vector = new Vector3();

			// generate vertices, normals and uvs

			for ( let iy = 0; iy < gridY1; iy ++ ) {

				const y = iy * segmentHeight - heightHalf;

				for ( let ix = 0; ix < gridX1; ix ++ ) {

					const x = ix * segmentWidth - widthHalf;

					// set values to correct vector component

					vector[ u ] = x * udir;
					vector[ v ] = y * vdir;
					vector[ w ] = depthHalf;

					// now apply vector to vertex buffer

					vertices.push( vector.x, vector.y, vector.z );

					// set values to correct vector component

					vector[ u ] = 0;
					vector[ v ] = 0;
					vector[ w ] = depth > 0 ? 1 : - 1;

					// now apply vector to normal buffer

					normals.push( vector.x, vector.y, vector.z );

					// uvs

					// uvs.push( ix / gridX );
					// uvs.push( 1 - ( iy / gridY ) );
					uvs.push( uvRange[0] + (ix / gridX) * uvRange[2] );
					uvs.push( uvRange[1] + (1 - ( iy / gridY)) * uvRange[3] );

					// counters

					vertexCounter += 1;

				}

			}

			// indices

			// 1. you need three indices to draw a single face
			// 2. a single segment consists of two faces
			// 3. so we need to generate six (2*3) indices per segment

			for ( let iy = 0; iy < gridY; iy ++ ) {

				for ( let ix = 0; ix < gridX; ix ++ ) {

					const a = numberOfVertices + ix + gridX1 * iy;
					const b = numberOfVertices + ix + gridX1 * ( iy + 1 );
					const c = numberOfVertices + ( ix + 1 ) + gridX1 * ( iy + 1 );
					const d = numberOfVertices + ( ix + 1 ) + gridX1 * iy;

					// faces

					indices.push( a, b, d );
					indices.push( b, c, d );

					// increase counter

					groupCount += 6;

				}

			}

			// add a group to the geometry. this will ensure multi material support

			scope.addGroup( groupStart, groupCount, materialIndex );

			// calculate new start value for groups

			groupStart += groupCount;

			// update total number of vertices

			numberOfVertices += vertexCounter;

		}

	}

	copy( source ) {

		super.copy( source );

		this.parameters = Object.assign( {}, source.parameters );

		return this;

	}

	static fromJSON( data ) {

		return new BoxGeometry( data.width, data.height, data.depth, data.widthSegments, data.heightSegments, data.depthSegments );

	}

}

export { BoxGeometry };