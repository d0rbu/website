import React, { useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import '../styles/3dLooker.scss';


const ROTATION_OFFSET = {
  x: 4.5,
  y: 0,
  z: 0
}
const START_ROTATION = {
  x: 4.75,
  y: 0,
  z: 0
}
const ROTATION_SENSITIVITY = 0.01
const FADE_IN_LENGTH = 1

function Model({ mouse, canvas }) {
  const mtl = useLoader(MTLLoader, '/owl.obj.mtl')
  const obj = useLoader(OBJLoader, '/owl.obj')
  const mesh = useRef()
  
  const [active, setActive] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const [fading, setFading] = useState(false)

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime()
    if (elapsedTime < FADE_IN_LENGTH) {  // if we need to do the fade in animation
      setOpacity(elapsedTime/FADE_IN_LENGTH)
      if (!fading) {  // if we haven't officially started fading yet, start now and set rotation
        mesh.current.rotation.z = START_ROTATION.z
        mesh.current.rotation.y = START_ROTATION.y
        mesh.current.rotation.x = START_ROTATION.x
      }

      return
    }

    if (fading) {  // if we were last fading but now the animation is over
      setFading(false)
      setOpacity(1)
    }

    if (mouse.isOver) {
      const canvasRect = canvas.current.getBoundingClientRect()
      // const centerX = canvas.current.offsetLeft + canvas.current.offsetWidth/2
      // const centerY = canvas.current.offsetTop + canvas.current.offsetHeight/2
      const centerX = canvasRect.x + canvasRect.width/2
      const centerY = canvasRect.y + canvasRect.height/2

      const mouseX = (mouse.x - centerX)  // mouse x relative to canvas
      const mouseY = (mouse.y - centerY)  // same for mouse y

      const lookX = Math.sign(mouseX) / (-1 - ROTATION_SENSITIVITY * Math.abs(mouseX)) + Math.sign(mouseX)
      const lookY = Math.sign(mouseY) / (-1 - ROTATION_SENSITIVITY * Math.abs(mouseY)) + Math.sign(mouseY)

      mesh.current.rotation.z = ROTATION_OFFSET.z + lookX
      mesh.current.rotation.y = ROTATION_OFFSET.y
      mesh.current.rotation.x = ROTATION_OFFSET.x + lookY 
    }
  })
  
  const texture = useLoader(TextureLoader, '/owl-texture.png')
  const geometry = useMemo(() => {
    let g;
    obj.traverse((c) => {
      if (c.type === "Mesh") {
        const _c = c
        g = _c.geometry;
      }
    });
    return g;
  }, [obj]);

  return (
    <mesh
      position={[0, 0, 0]}
      materials={mtl.materials}
      ref={mesh}
      onClick={(event) => setActive(!active)}
      geometry={geometry}
      scale={3}
    >
      <meshStandardMaterial
        map={texture}
        flatShading
        transparent
        opacity={opacity}
      />
    </mesh>
  )
}

export default function Looker({ mouse, ...canvasProps }) {
  const canvas = useRef()

  return (
    <div id="canvas">
      <Canvas
      {...canvasProps}
      ref={canvas}
      >
        <ambientLight
          intensity={0.15}
        />
        <pointLight
          position={[0, 0, 3]}
          intensity={0.8}
        />
        <Model
          mouse={mouse}
          canvas={canvas}
        />
      </Canvas>
    </div>
    )
  }