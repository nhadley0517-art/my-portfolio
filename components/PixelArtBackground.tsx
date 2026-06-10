"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animated pixel-art hero background.
 * Renders a flat PNG through a WebGL shader that adds:
 *  - wind sway on the lower (grass) region
 *  - a gentle cloud drift/sway up top
 *  - subtle mouse parallax + slight zoom for depth
 * Falls back to a static <img> if WebGL is unavailable.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;          // 0 = bottom, 1 = top
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uTime;
uniform vec2 uRes;   // canvas pixels
uniform vec2 uImg;   // image pixels
uniform vec2 uMouse; // -0.5..0.5

void main() {
  // "cover" the canvas with the image (no distortion)
  float scale = max(uRes.x / uImg.x, uRes.y / uImg.y);
  vec2 drawSize = uImg * scale;
  vec2 offset = (uRes - drawSize) * 0.5;
  vec2 uv = (vUv * uRes - offset) / drawSize;

  // slight zoom hides the cropped/displaced edges
  uv = (uv - 0.5) / 1.06 + 0.5;

  // gentle, slow wind on the grass (bottom of the image)
  float windMask = smoothstep(0.34, 0.0, uv.y);
  float wind = sin(uTime * 1.0 + uv.y * 13.0 + uv.x * 4.5) * 0.003 * windMask;

  // gentle cloud sway (top of the image)
  float skyMask = smoothstep(0.55, 1.0, uv.y);
  float cloud = sin(uTime * 0.22 + uv.y * 2.5) * 0.005 * skyMask;

  vec2 suv = vec2(uv.x + wind + cloud, uv.y);
  // Crop out the bottom-right Gemini watermark — never sample that corner.
  // (v is flipped, so the image bottom is v near 0.)
  suv.x = suv.x * 0.90;        // shave ~10% off the right
  suv.y = 0.13 + suv.y * 0.87; // shave ~13% off the bottom
  suv = clamp(suv, 0.0, 1.0);
  gl_FragColor = texture2D(uTex, suv);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.error("shader error:", gl.getShaderInfoLog(sh));
    return null;
  }
  return sh;
}

export default function PixelArtBackground({ src = "/pixelart.png" }: { src?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) { setFailed(true); return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFailed(true); return; }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFailed(true); return; }
    gl.useProgram(prog);

    // fullscreen quad
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uRes = gl.getUniformLocation(prog, "uRes");
    const uImg = gl.getUniformLocation(prog, "uImg");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    let raf = 0;
    let disposed = false;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    let imgW = 1, imgH = 1;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const onMouse = (e: MouseEvent) => {
      mouse.tx = e.clientX / window.innerWidth - 0.5;
      mouse.ty = e.clientY / window.innerHeight - 0.5;
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (disposed) return;
      imgW = img.naturalWidth; imgH = img.naturalHeight;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); // crisp pixels
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

      resize();
      const start = performance.now();
      const loop = () => {
        if (disposed) return;
        const t = (performance.now() - start) / 1000;
        mouse.x += (mouse.tx - mouse.x) * 0.05;
        mouse.y += (mouse.ty - mouse.y) * 0.05;
        gl.uniform1f(uTime, t);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uImg, imgW, imgH);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        raf = requestAnimationFrame(loop);
      };
      loop();
    };
    img.onerror = () => setFailed(true);
    img.src = src;

    // Keep the canvas backing store matched to its displayed size at all times
    // (fixes blur from a stale/too-small backing after remounts or layout shifts).
    const ro = new ResizeObserver(() => resize());
    ro.observe(canvas);
    window.addEventListener("mousemove", onMouse);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMouse);
    };
  }, [src]);

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", imageRendering: "pixelated" }} />;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", imageRendering: "pixelated" }}
    />
  );
}
