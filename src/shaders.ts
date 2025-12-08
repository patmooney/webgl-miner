export const vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform int tileX;
uniform int tileW;
uniform float u_atlas_w;
uniform vec2 camera;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

uniform vec3 u_light[16];

uniform highp sampler2D u_data;

out vec2 v_texcoord;
out float bright;
out float b_type;
out float durability;
out float atlas_w;

bool get_solid(float x, float y) {
  ivec2 pos = ivec2(int(x), int(y));
  float t = texelFetch(u_data, pos, 0).b;
  return t == 1.0;
}

bool is_blocked (vec2 pos1, vec2 pos2, int dist) {
  float x1 = pos1.x;
  float y1 = pos1.y;
  float x2 = pos2.x;
  float y2 = pos2.y;

  float dx = abs(x1 - x2);
  float dy = abs(y1 - y2);
  float sx = sign(x1 - x2);
  float sy = sign(y1 - y2);
  float err = dx - dy;

  if (dx < 2.0 && dy < 2.0) {
    return false;
  }

  for (int i = 0; i < dist; i++) {
    if (x1 == x2 && y1 == y2) {
      return false;
    }
    float err2 = 2.0 * err;
    if (err2 > -dy) {
      err -= dy;
      x2 += sx;
    }
    if (err2 < dx) {
      err += dx;
      y2 += sy;
    }
    if (get_solid(x2, y2) == true) {
      return true;
    }
  }

  return false;
}

// all shaders have a main function
void main() {
  int row = int(floor(float(gl_InstanceID) / float(tileX)));
  int col = int(mod(float(gl_InstanceID), float(tileX)));

  bright = 0.1;
  for (int i = 0; i < 16; i++) {
    if (u_light[i].z > 0.0) {
      vec2 l = u_light[i].xy;
      float d = distance(l.xy, vec2(col, row));
      if (d < u_light[i].z && !is_blocked(l.xy, vec2(col, row), int(u_light[i].z))) {
        bright += min(0.8, 1.0 - (d / u_light[i].z));
      }
    }
  }

  float xOffset = float(col * (tileW));
  float yOffset = float(row * (tileW));

  vec2 instPos = vec2(a_position);
  instPos.x += xOffset + camera.x;
  instPos.y += yOffset + camera.y;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = instPos / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);

  vec2 tile = texelFetch(u_data, ivec2(col, row), 0).rg;

  b_type = tile.r;
  durability = tile.g;
  v_texcoord = a_texcoord;
  atlas_w = u_atlas_w;
}

`;

export const fragmentShaderSource = `#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;

in float b_type;
in float durability;
in float atlas_w;
in float bright;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec2 tcoord = vec2(v_texcoord.x + (atlas_w * b_type), v_texcoord.y);
  outColor = texture(u_texture, tcoord) * vec4(1.0, durability, durability, 1.0);
  outColor = outColor * vec4(bright, bright, bright, 1.0);
}`;

export const entityVertexSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer

in vec2 a_position;
in vec2 a_texcoord;

uniform vec2 camera;
uniform vec2 u_movement;
uniform vec2 u_rotation;
uniform float tileW;
uniform int u_selected;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

out vec2 v_texcoord;
out float b_type;
out float is_selected;

// all shaders have a main function
void main() {

  // 10.0 is half of tileW, because we need to offset for rotation to center of tile
  vec2 p = a_position;
  float tW = float(tileW);
  p.x -= tW;
  p.y -= tW;

  vec2 rotated = vec2(
    p.x * u_rotation.y +
        p.y * u_rotation.x,
    p.y * u_rotation.y -
        p.x * u_rotation.x
  );

  rotated += tW;
  rotated += tW;

  rotated += camera + u_movement;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = rotated / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace, 0, 1);

  v_texcoord = a_texcoord;
  is_selected = float(u_selected);
}
`;

export const entityFragmentSource = `#version 300 es

precision highp float;

// Passed in from the vertex shader.
in vec2 v_texcoord;
in float is_selected;

// The texture.
uniform sampler2D u_texture;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  vec4 color = texture(u_texture, v_texcoord);
  outColor = vec4(
    color.r,
    color.g,
    // make hidden pixels a transparent blue colour
    color.b + ((1.0 - color.a) * (0.5 * is_selected)),
    color.a + (0.25 * is_selected)
  );
}`;
