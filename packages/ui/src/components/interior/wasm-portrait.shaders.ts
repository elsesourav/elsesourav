export const PIXEL_VS = /* glsl */ `
  attribute vec2 a_pos;
  attribute vec4 a_color;
  attribute float a_size;
  uniform float u_point_scale;
  uniform vec2 u_scale;
  uniform vec2 u_offset;
  uniform float u_scatter;
  varying vec4 v_color;

  void main() {
    vec2 pos = a_pos * u_scale * u_scatter + u_offset;
    gl_Position = vec4(pos, 0.0, 1.0);
    gl_PointSize = a_size * u_point_scale;
    v_color = a_color;
  }
`;

export const PIXEL_FS = /* glsl */ `
  precision mediump float;
  varying vec4 v_color;

  void main() {
    // Seamless solid square point sprites with zero mesh grid lines
    gl_FragColor = v_color;
  }
`;
