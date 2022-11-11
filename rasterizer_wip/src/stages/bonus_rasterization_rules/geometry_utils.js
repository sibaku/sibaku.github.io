
function transform({ pos = vec3(0.0, 0.0, 0.0),
    scale = vec3(1.0, 1.0, 1.0),
    rot = jsm.MatF32.id(4, 4)
}) {
    return mult(
        jsm.translation(pos),
        mult(
            rot,
            jsm.scaling(scale)
        ));
}

function compute_geometry_bounds(vertices) {
    const bmin = vec4(Infinity, Infinity, Infinity, Infinity);
    const bmax = vec4(-Infinity, -Infinity, -Infinity, -Infinity);

    for (let i = 0; i < vertices.length; i++) {
        const vi = vertices[i];

        jsm.cwiseMin(bmin, vi, bmin);
        jsm.cwiseMax(bmax, vi, bmax);
    }

    const center = jsm.scale(jsm.add(bmax, bmin), 0.5);
    const half_size = jsm.scale(jsm.sub(bmax, bmin), 0.5);

    return { bmin, bmax, center, half_size };
}


class Renderable {
    constructor(geometry, {
        local_transform = jsm.MatF32.id(4, 4),
        parent = null,
        material = {}
    } = {}) {
        this.geometry = geometry;
        this.material = material;
        this.local_transform = local_transform;

        this.parent = parent;

        let p = parent;
        let transform = local_transform;

        while (parent !== null) {
            transform = mult(parent.transform, transform);
            parent = parent.parent;
        }

        this.local_to_world = transform;
        this.world_to_local = jsm.inv(transform);

    }

    static new() {
        return new Renderable(...arguments);
    }

    set_local_transform(local_transform) {
        let p = this.parent;
        let transform = local_transform;

        while (parent !== null) {
            transform = mult(parent.transform, transform);
            parent = parent.parent;
        }

        this.local_to_world = transform;
        this.world_to_local = jsm.inverse(transform);
    }
}


function create_cube_geometry() {

    // messy manual specification of vertices
    const vertices =
        [// front face
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(-1.0, 1.0, 1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(1.0, -1.0, 1.0, 1.0),
            // right face
            vec4(1.0, -1.0, 1.0, 1.0),
            vec4(1.0, -1.0, -1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(1.0, -1.0, -1.0, 1.0),
            vec4(1.0, 1.0, -1.0, 1.0),
            // back face
            vec4(1.0, -1.0, -1.0, 1.0),
            vec4(-1.0, -1.0, -1.0, 1.0),
            vec4(1.0, 1.0, -1.0, 1.0),
            vec4(1.0, 1.0, -1.0, 1.0),
            vec4(-1.0, -1.0, -1.0, 1.0),
            vec4(-1.0, 1.0, -1.0, 1.0),
            // left face
            vec4(-1.0, -1.0, -1.0, 1.0),
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(-1.0, 1.0, -1.0, 1.0),
            vec4(-1.0, 1.0, -1.0, 1.0),
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(-1.0, 1.0, 1.0, 1.0),
            // top face
            vec4(-1.0, 1.0, 1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(-1.0, 1.0, -1.0, 1.0),
            vec4(-1.0, 1.0, -1.0, 1.0),
            vec4(1.0, 1.0, 1.0, 1.0),
            vec4(1.0, 1.0, -1.0, 1.0),
            // bottom face
            vec4(-1.0, -1.0, -1.0, 1.0),
            vec4(1.0, -1.0, -1.0, 1.0),
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(-1.0, -1.0, 1.0, 1.0),
            vec4(1.0, -1.0, -1.0, 1.0),
            vec4(1.0, -1.0, 1.0, 1.0)
        ];
    const uvs = [
        // front face
        vec2(0.0, 0.0),
        vec2(1.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 1.0),
        vec2(0.0, 0.0),
        vec2(0.0, 1.0),
        // right face
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        // back face
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        // left face
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        // top face
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0),
        // bottom face
        vec2(0.0, 0.0),
        vec2(1.0, 0.0),
        vec2(0.0, 1.0),
        vec2(0.0, 1.0),
        vec2(1.0, 0.0),
        vec2(1.0, 1.0)
    ];
    const normals = [
        // front face
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0),
        // right face
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        // back face
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        // left face
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        vec3(-1.0, 0.0, 0.0),
        // top face
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),
        // bottom face
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0),
        vec3(0.0, -1.0, 0.0)
    ];

    const attributes = {};
    attributes[Attribute.VERTEX] = vertices;
    attributes[Attribute.NORMAL] = normals;
    attributes[Attribute.UV] = uvs;

    const geom = {
        attributes,
        topology: Topology.TRIANGLES
    };


    return geom;
}


function create_plane_geometry() {

    const vertices = [
        vec4(-1.0, 0.0, -1.0, 1.0), vec4(-1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, -1.0, 1.0),

        vec4(1.0, 0.0, -1.0, 1.0), vec4(-1.0, 0.0, 1.0, 1.0),
        vec4(1.0, 0.0, 1.0, 1.0),

    ];
    const normals = [
        vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),

        vec3(0.0, 1.0, 0.0), vec3(0.0, 1.0, 0.0),
        vec3(0.0, 1.0, 0.0),

    ];
    const uvs = [
        vec2(1.0, 0.0), vec2(0.0, 0.0),
        vec2(1.0, 1.0),

        vec2(1.0, 1.0), vec2(0.0, 0.0),
        vec2(1.0, 0.0),

    ];
    const attributes = {};
    attributes[Attribute.VERTEX] = vertices;
    attributes[Attribute.NORMAL] = normals;
    attributes[Attribute.UV] = uvs;

    const geom = {
        attributes,
        topology: Topology.TRIANGLES
    };


    return geom;
}