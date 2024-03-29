import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { useTheme } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import '../styles/3dLooker.scss';


const ROTATION_OFFSET = {
  x: 4.75,
  y: 0,
  z: 0
}
const ROTATION_SENSITIVITY = 1.5
const INTERACTION_TIMEOUT = 10

function Model({ mouse, canvas, setInteracted, interacted, setOpen, open, setCursor, fadeTime }) {
  const mtl = useLoader(MTLLoader, '/assets/owl.obj.mtl')
  const obj = useLoader(OBJLoader, '/assets/owl.obj')
  const mesh = useRef()
  
  const [active, setActive] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const [fading, setFading] = useState('not_started')

  useFrame((state, delta) => {
    const elapsedTime = state.clock.getElapsedTime()
    if (elapsedTime < fadeTime) {
      setOpacity(elapsedTime/fadeTime)
    }
    if (fading === 'not_started') {  // if we haven't officially started fading yet, start now and set rotation
      mesh.current.rotation.z = ROTATION_OFFSET.z
      mesh.current.rotation.y = ROTATION_OFFSET.y
      mesh.current.rotation.x = ROTATION_OFFSET.x
      setFading('fading')
    }
    if (elapsedTime > fadeTime && fading === 'fading') {  // if we are transitioning from fading to not fading
      setFading('done')
      setOpacity(1)
    }

    if (mouse.isOver) {
      const canvasRect = canvas.current.getBoundingClientRect()
      const centerX = canvasRect.x + canvasRect.width/2
      const centerY = canvasRect.y + canvasRect.height/2

      const mouseX = (mouse.clientX - centerX) / window.innerWidth  // mouse x relative to canvas
      const mouseY = (mouse.clientY - centerY) / window.innerHeight // same for mouse y

      const lookX = Math.sign(mouseX) / (-1 - ROTATION_SENSITIVITY * Math.abs(mouseX)) + Math.sign(mouseX)
      const lookY = Math.sign(mouseY) / (-1 - ROTATION_SENSITIVITY * Math.abs(mouseY)) + Math.sign(mouseY)

      mesh.current.rotation.z = ROTATION_OFFSET.z + lookX * ROTATION_SENSITIVITY
      mesh.current.rotation.y = ROTATION_OFFSET.y
      mesh.current.rotation.x = ROTATION_OFFSET.x + lookY * ROTATION_SENSITIVITY
    }
  })
  
  const texture = useLoader(TextureLoader, '/assets/owl-texture.png')
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
      geometry={geometry}
      scale={3}
      onClick={(event) => {
        if (fading === 'done') {
          setOpen(active ? 'closed' : 'open')
          setActive(!active)
        }
      }}
      onPointerOver={(event) => {
        if (fading === 'done') {
          setCursor('pointer')
          
          if (open === 'closed') {
            setOpen('half')
          }
        }
        if (!interacted) {
          setInteracted(true)
        }
      }}
      onPointerOut={(event) => {
        if (open === 'half') {
          setOpen('closed')
        }
        if (fading === 'done') {
          setCursor('auto')
        }
      }}
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

export default function Looker({ mouse, setInteracted, interacted, setSpeech, speech, setOpen, open, fadeTime, ...canvasProps }) {
  const theme = useTheme()
  const canvas = useRef()
  const [cursorStyle, setCursor] = useState('auto')
  useEffect(() => {
    if (!interacted) {  // if interacted is set to false, we set the timer to nudge the user
      const timeout = setTimeout(() => {
        setSpeech('Try clicking me 👀')
      }, INTERACTION_TIMEOUT * 1000)
  
      return () => {
        clearTimeout(timeout)
      }
    }  // if interacted is true, do nothing. the timeout shouldve been cleared by the cleanup function
  }, [interacted])

  return (
    <div id="canvas">
      <Canvas
      {...canvasProps}
      ref={canvas}
      style={{ cursor: cursorStyle }}
      >
        <ambientLight
          intensity={0}
        />
        <pointLight
          position={[0, 0, 3]}
          intensity={0.8}
        />
        <Model
          mouse={mouse}
          canvas={canvas}
          setInteracted={setInteracted}
          interacted={interacted}
          setOpen={setOpen}
          open={open}
          setCursor={setCursor}
          fadeTime={fadeTime}
        />
      </Canvas>
      <Paper
        elevation={8}
        id="speech-bubble"
        key={speech}
        className={speech === 'N/A' ? '' : 'say'}
        sx={{
          padding: theme.spacing(1),
        }}
      >
        <Typography variant="body2" align="right" noWrap>
          {speech}
        </Typography>
      </Paper>
    </div>
    )
  }